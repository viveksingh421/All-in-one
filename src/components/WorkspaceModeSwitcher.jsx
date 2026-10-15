import React from 'react';
import { BookOpen, Code2, Compass, Sparkles } from 'lucide-react';

export const WORKSPACE_MODES = [
  {
    id: 'study',
    label: 'Study Mode',
    desc: 'Soft indigo & emerald calm aura',
    icon: BookOpen,
    speed: 0.8,
    ambientGradient:
      'radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.12) 0px, transparent 55%), radial-gradient(at 100% 0%, rgba(52, 211, 153, 0.10) 0px, transparent 50%), radial-gradient(at 50% 100%, rgba(56, 189, 248, 0.08) 0px, transparent 60%)',
    accentColor: '#818cf8',
  },
  {
    id: 'coding',
    label: 'Coding Mode',
    desc: 'High-contrast cyan & electric purple',
    icon: Code2,
    speed: 1.4,
    ambientGradient:
      'radial-gradient(at 0% 0%, rgba(56, 189, 248, 0.14) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(192, 132, 252, 0.14) 0px, transparent 55%), radial-gradient(at 50% 100%, rgba(244, 114, 182, 0.09) 0px, transparent 60%)',
    accentColor: '#38bdf8',
  },
  {
    id: 'deep-focus',
    label: 'Deep Focus',
    desc: 'Ultra-dim cosmic obsidian & deep violet',
    icon: Compass,
    speed: 0.4,
    ambientGradient:
      'radial-gradient(at 0% 0%, rgba(79, 70, 229, 0.08) 0px, transparent 60%), radial-gradient(at 100% 0%, rgba(147, 51, 234, 0.08) 0px, transparent 60%), radial-gradient(at 50% 100%, rgba(15, 23, 42, 0.95) 0px, transparent 70%)',
    accentColor: '#c084fc',
  },
];

export const WorkspaceModeSwitcher = ({ activeMode, onSelectMode }) => {
  return (
    <div className="fixed bottom-3 sm:bottom-6 right-3 sm:right-6 z-40">
      <div className="glass-panel p-1 sm:p-1.5 rounded-xl sm:rounded-2xl border border-white/15 shadow-[0_15px_40px_rgba(0,0,0,0.6)] flex items-center gap-1 sm:gap-1.5 backdrop-blur-2xl">
        {WORKSPACE_MODES.map((mode) => {
          const Icon = mode.icon;
          const isActive = activeMode === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => onSelectMode(mode.id)}
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-mono transition-all duration-300 ${
                isActive
                  ? 'bg-white/15 border border-white/20 text-white shadow-[0_0_15px_rgba(255,255,255,0.15)] font-semibold'
                  : 'text-starlight-300/60 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
              title={mode.desc}
            >
              <Icon
                className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${
                  isActive ? 'text-cyan-300 animate-pulse' : 'text-starlight-300/50'
                }`}
              />
              <span className="hidden md:inline">{mode.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
