import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Radio, Sparkles, CloudRain, Disc3, Sliders, Check } from 'lucide-react';
import { soundManager } from '../utils/audio';

export const SoundPlayer = () => {
  const [activeSound, setActiveSound] = useState(() => {
    try {
      const autoPlay = localStorage.getItem('aether_sound_autoplay') === 'true';
      const lastSound = localStorage.getItem('aether_last_sound');
      return autoPlay && lastSound ? lastSound : null;
    } catch {
      return null;
    }
  });

  const [volume, setVolumeState] = useState(() => {
    try {
      const saved = localStorage.getItem('aether_sound_volume');
      return saved !== null ? Math.round(parseFloat(saved) * 100) : 45;
    } catch {
      return 45;
    }
  });

  const [autoPlay, setAutoPlay] = useState(() => {
    try {
      return localStorage.getItem('aether_sound_autoplay') === 'true';
    } catch {
      return false;
    }
  });

  const [isOpen, setIsOpen] = useState(false);

  // Resume auto-played sound on first user gesture if configured
  useEffect(() => {
    if (autoPlay && activeSound) {
      soundManager.playTrack(activeSound);
    }
  }, []);

  const handleVolumeChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setVolumeState(val);
    soundManager.setVolume(val / 100);
  };

  const handleToggleAutoPlay = () => {
    const nextVal = !autoPlay;
    setAutoPlay(nextVal);
    try {
      localStorage.setItem('aether_sound_autoplay', nextVal.toString());
    } catch {
      // ignore
    }
  };

  const toggleSound = (soundKey) => {
    if (activeSound === soundKey) {
      soundManager.stop();
      setActiveSound(null);
      try {
        localStorage.removeItem('aether_last_sound');
      } catch {
        // ignore
      }
    } else {
      soundManager.playTrack(soundKey);
      setActiveSound(soundKey);
      try {
        localStorage.setItem('aether_last_sound', soundKey);
      } catch {
        // ignore
      }
    }
  };

  const tracks = [
    {
      id: 'cosmic',
      label: 'Deep Void Drone',
      desc: 'Warm harmonic 110Hz space resonance',
      icon: Disc3,
      color: 'from-indigo-500 to-purple-600',
    },
    {
      id: 'drift',
      label: 'Solar Drift',
      desc: 'Airy celestial drift with pink atmosphere',
      icon: Sparkles,
      color: 'from-cyan-500 to-blue-600',
    },
    {
      id: 'rain',
      label: 'Cosmic Stardust Rain',
      desc: 'Gentle soothing ambient frequencies & stardust pings',
      icon: CloudRain,
      color: 'from-teal-400 to-emerald-600',
    },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-sm sm:text-base font-mono font-bold transition-all duration-300 border cursor-pointer active:scale-95 shadow-md ${
          activeSound
            ? 'bg-nebula-cyan/25 border-nebula-cyan text-nebula-cyan shadow-[0_0_20px_rgba(56,189,248,0.4)] animate-pulse'
            : 'bg-space-900/80 border-white/15 text-starlight-100 hover:text-white hover:border-white/30'
        }`}
        title="Ambient Cosmic Soundscapes"
      >
        {activeSound ? <Volume2 className="w-5 h-5 text-nebula-cyan" /> : <VolumeX className="w-5 h-5" />}
        <span className="hidden sm:inline">
          {activeSound ? `Sound: ${activeSound}` : 'Soundscapes'}
        </span>
        {activeSound && (
          <span className="w-2.5 h-2.5 rounded-full bg-nebula-cyan animate-ping" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 p-4 rounded-3xl glass-panel border border-white/20 z-50 shadow-[0_20px_60px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/15">
            <div className="flex items-center gap-2.5">
              <Radio className="w-5 h-5 text-nebula-cyan" />
              <span className="text-base font-bold text-white tracking-wide font-sans">
                Cosmic Soundscapes
              </span>
            </div>
            {activeSound && (
              <button
                onClick={() => {
                  soundManager.stop();
                  setActiveSound(null);
                  try {
                    localStorage.removeItem('aether_last_sound');
                  } catch {
                    // ignore
                  }
                }}
                className="text-xs text-rose-300 hover:text-rose-200 uppercase tracking-wider font-mono font-bold px-2 py-1 rounded-lg bg-rose-500/20 border border-rose-500/30 cursor-pointer"
              >
                Mute All
              </button>
            )}
          </div>

          {/* Volume percentage slider */}
          <div className="mb-4 p-3 rounded-2xl bg-space-900/70 border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-starlight-200 font-bold flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-cyan-300" /> Master Volume
              </span>
              <span className="text-cyan-300 font-bold">{volume}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={handleVolumeChange}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Auto-Play Toggle */}
          <div
            onClick={handleToggleAutoPlay}
            className="mb-3 px-3 py-2 rounded-xl bg-space-900/60 border border-white/10 flex items-center justify-between cursor-pointer hover:bg-space-850 transition-colors"
          >
            <span className="text-xs font-mono text-starlight-200 font-semibold">
              Auto-resume on launch
            </span>
            <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
              autoPlay ? 'bg-cyan-500 border-cyan-400 text-white' : 'border-white/20'
            }`}>
              {autoPlay && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>
          </div>

          <div className="space-y-2.5">
            {tracks.map((track) => {
              const Icon = track.icon;
              const isSelected = activeSound === track.id;
              return (
                <button
                  key={track.id}
                  onClick={() => toggleSound(track.id)}
                  className={`w-full flex items-center gap-3.5 p-3 rounded-2xl text-left transition-all border cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-500/20 border-nebula-cyan/70 shadow-[0_0_18px_rgba(56,189,248,0.3)]'
                      : 'bg-space-850/60 border-white/10 hover:border-white/25 hover:bg-space-850'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${track.color} text-white shadow-inner shrink-0`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm sm:text-base font-bold text-white truncate">
                      {track.label}
                    </p>
                    <p className="text-xs sm:text-sm text-starlight-200 truncate mt-0.5 font-sans">
                      {track.desc}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="w-1.5 h-4 bg-nebula-cyan rounded-full animate-bounce" />
                      <span className="w-1.5 h-5 bg-nebula-cyan rounded-full animate-bounce [animation-delay:0.15s]" />
                      <span className="w-1.5 h-3 bg-nebula-cyan rounded-full animate-bounce [animation-delay:0.3s]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-starlight-300 font-mono text-center mt-3.5">
            Procedurally synthesized with Web Audio API.
          </p>
        </div>
      )}
    </div>
  );
};
