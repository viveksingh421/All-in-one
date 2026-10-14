import React, { useState, useEffect } from 'react';
import { Minimize2, Check, Clock, Sparkles, Flame, Eye } from 'lucide-react';
import { particleDisintegrator } from '../utils/particleDisintegrator';
import { soundManager } from '../utils/audio';

export const DeepSpaceFocusModal = ({ task, onClose, onToggleComplete, onUpdateTask }) => {
  const [selectedDuration, setSelectedDuration] = useState(60); // 60 min default deep work
  const [seconds, setSeconds] = useState(60 * 60);
  const [timerRunning, setTimerRunning] = useState(false);

  const DURATION_PRESETS = [
    { label: '25m', mins: 25, desc: 'Pomodoro Sprint' },
    { label: '45m', mins: 45, desc: 'Flow Orbit' },
    { label: '60m', mins: 60, desc: 'Deep Space Hour' },
    { label: '90m', mins: 90, desc: 'Ultradian Focus' },
    { label: '120m', mins: 120, desc: 'Deep Warp Sprint' },
  ];

  const handleSelectPreset = (mins) => {
    setSelectedDuration(mins);
    setTimerRunning(false);
    setSeconds(mins * 60);
  };

  useEffect(() => {
    let interval = null;
    if (timerRunning && seconds > 0) {
      interval = setInterval(() => setSeconds((s) => s - 1), 1000);
    } else if (seconds === 0) {
      setTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [timerRunning, seconds]);

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCompleteInFocus = (e) => {
    const btn = e.currentTarget;
    particleDisintegrator.explode(btn, '#38bdf8');
    soundManager.playChime('complete');
    onToggleComplete(task.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Deep Space Dark Backdrop with extreme blur */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-space-950/90 backdrop-blur-2xl transition-opacity animate-in fade-in duration-500 cursor-pointer"
      />

      {/* Central Serene Focal Point Card */}
      <div className="relative w-full max-w-2xl p-8 rounded-3xl glass-panel border border-cyan-400/40 shadow-[0_0_80px_rgba(56,189,248,0.25)] z-10 animate-in zoom-in-95 duration-400">
        {/* Glow ambient highlight */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-cyan-500/20 rounded-full blur-[100px] pointer-events-none" />

        {/* Modal Top Bar */}
        <div className="flex items-center justify-between pb-6 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
            <h2 className="text-sm uppercase font-mono tracking-widest text-cyan-300 font-bold flex items-center gap-2">
              Deep Space Focus Chamber
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-starlight-100 hover:text-white text-xs sm:text-sm font-mono border border-white/15 transition-all font-semibold active:scale-95 cursor-pointer"
          >
            <Minimize2 className="w-4 h-4" />
            <span>Return to Orbit</span>
          </button>
        </div>

        {/* Focal Task Content */}
        <div className="my-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono uppercase bg-cyan-500/15 border border-cyan-400/40 text-cyan-200 font-bold">
            <Sparkles className="w-4 h-4" />
            Current Celestial Mission
          </div>

          <h1
            className={`font-serif text-3xl md:text-5xl text-white font-bold leading-relaxed tracking-wide ${
              task.completed ? 'line-through text-starlight-300/40' : ''
            }`}
          >
            "{task.title}"
          </h1>

          {task.tags && task.tags.length > 0 && (
            <div className="flex items-center justify-center gap-2.5 pt-1 flex-wrap">
              {task.tags.map((t, idx) => (
                <span
                  key={idx}
                  className="text-xs sm:text-sm font-mono text-purple-200 bg-purple-500/15 border border-purple-500/30 px-3 py-1 rounded-full font-semibold"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}

          {/* Chrono Timer for deep focus sessions */}
          <div className="pt-6 pb-2">
            {/* Session Duration Selector */}
            <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
              {DURATION_PRESETS.map((p) => {
                const isSelected = selectedDuration === p.mins;
                return (
                  <button
                    key={p.mins}
                    onClick={() => handleSelectPreset(p.mins)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-mono font-bold transition-all border cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-500/30 border-cyan-400 text-cyan-100 shadow-[0_0_15px_rgba(56,189,248,0.4)]'
                        : 'bg-white/5 border-white/10 text-starlight-200 hover:text-white hover:border-white/25 hover:bg-white/10'
                    }`}
                    title={p.desc}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>

            <div className="font-mono text-6xl md:text-7xl font-light text-cyan-100 tracking-wider">
              {formatTime(seconds)}
            </div>
            <div className="flex items-center justify-center gap-4 mt-5">
              <button
                onClick={() => setTimerRunning(!timerRunning)}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold font-mono border transition-all cursor-pointer active:scale-95 ${
                  timerRunning
                    ? 'bg-rose-500/25 border-rose-500/50 text-rose-200 hover:bg-rose-500/35'
                    : 'bg-cyan-500/25 border-cyan-400/50 text-cyan-100 hover:bg-cyan-500/35 shadow-[0_0_20px_rgba(56,189,248,0.3)]'
                }`}
              >
                {timerRunning ? 'Pause Chrono' : 'Initiate Warp Chrono'}
              </button>
              <button
                onClick={() => {
                  setTimerRunning(false);
                  setSeconds(selectedDuration * 60);
                }}
                className="px-4 py-2.5 rounded-xl text-sm font-mono text-starlight-200 hover:text-white bg-white/5 border border-white/15 hover:bg-white/10 cursor-pointer font-semibold"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="pt-6 border-t border-white/10 flex items-center justify-between flex-wrap gap-3">
          <p className="text-xs sm:text-sm text-starlight-300 font-mono">
            Zero gravity mode • Distractions suppressed
          </p>

          <button
            onClick={handleCompleteInFocus}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer active:scale-95 ${
              task.completed
                ? 'bg-space-900 border border-white/20 text-starlight-300'
                : 'bg-gradient-to-r from-cyan-400 to-purple-600 hover:from-cyan-300 hover:to-purple-500 text-white shadow-[0_0_25px_rgba(56,189,248,0.4)]'
            }`}
          >
            <Check className="w-5 h-5 stroke-[2.5]" />
            <span>{task.completed ? 'Mission Accomplished' : 'Complete Mission & Disintegrate'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
