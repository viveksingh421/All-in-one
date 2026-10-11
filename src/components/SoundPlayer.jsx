import React, { useState } from 'react';
import { Volume2, VolumeX, Radio, Sparkles, CloudRain, Disc3 } from 'lucide-react';
import { soundManager } from '../utils/audio';

export const SoundPlayer = () => {
  const [activeSound, setActiveSound] = useState(null); // 'cosmic' | 'rain' | 'drift' | null
  const [isOpen, setIsOpen] = useState(false);

  const toggleSound = (soundKey) => {
    if (activeSound === soundKey) {
      soundManager.stop();
      setActiveSound(null);
    } else {
      soundManager.playTrack(soundKey);
      setActiveSound(soundKey);
    }
  };

  const tracks = [
    {
      id: 'cosmic',
      label: 'Deep Void Drone',
      desc: 'Warm harmonic 55Hz space resonance',
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
      desc: 'Gentle soothing ambient frequencies',
      icon: CloudRain,
      color: 'from-teal-400 to-emerald-600',
    },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-300 border ${
          activeSound
            ? 'bg-nebula-cyan/20 border-nebula-cyan/50 text-nebula-cyan shadow-[0_0_15px_rgba(56,189,248,0.3)] animate-pulse'
            : 'bg-space-900/60 border-white/10 text-starlight-300 hover:text-white hover:border-white/20'
        }`}
        title="Ambient Cosmic Soundscapes"
      >
        {activeSound ? <Volume2 className="w-4 h-4 text-nebula-cyan" /> : <VolumeX className="w-4 h-4" />}
        <span className="hidden sm:inline">
          {activeSound ? `Sound: ${activeSound}` : 'Soundscapes'}
        </span>
        {activeSound && (
          <span className="w-2 h-2 rounded-full bg-nebula-cyan animate-ping" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-72 p-3.5 rounded-2xl glass-panel border border-white/15 z-50 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-nebula-cyan" />
              <span className="text-xs font-semibold text-white tracking-wide">
                Cosmic Soundscapes
              </span>
            </div>
            {activeSound && (
              <button
                onClick={() => {
                  soundManager.stop();
                  setActiveSound(null);
                }}
                className="text-[10px] text-red-300 hover:text-red-200 uppercase tracking-wider"
              >
                Mute All
              </button>
            )}
          </div>

          <div className="space-y-2">
            {tracks.map((track) => {
              const Icon = track.icon;
              const isSelected = activeSound === track.id;
              return (
                <button
                  key={track.id}
                  onClick={() => toggleSound(track.id)}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all border ${
                    isSelected
                      ? 'bg-white/10 border-nebula-cyan/60 shadow-[0_0_12px_rgba(56,189,248,0.25)]'
                      : 'bg-space-850/40 border-white/5 hover:border-white/15 hover:bg-space-850/70'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br ${track.color} text-white shadow-inner`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">
                      {track.label}
                    </p>
                    <p className="text-[10px] text-starlight-300/70 truncate">
                      {track.desc}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="flex items-center gap-0.5">
                      <span className="w-1 h-3 bg-nebula-cyan rounded-full animate-bounce" />
                      <span className="w-1 h-4 bg-nebula-cyan rounded-full animate-bounce [animation-delay:0.15s]" />
                      <span className="w-1 h-2 bg-nebula-cyan rounded-full animate-bounce [animation-delay:0.3s]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          <p className="text-[10px] text-starlight-300/50 text-center mt-3">
            Procedurally synthesized with Web Audio API.
          </p>
        </div>
      )}
    </div>
  );
};
