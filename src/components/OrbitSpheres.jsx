import React from 'react';
import { Orbit, Sparkles, Folder, Rocket, Star, CheckCircle2 } from 'lucide-react';

export const OrbitSpheres = ({
  categories,
  activeCategory,
  onSelectCategory,
  taskCounts,
}) => {
  return (
    <div className="relative w-full max-w-5xl mx-auto mb-8 px-4">
      {/* Category orbital dock / planet hub */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-2">
        <div className="flex items-center gap-2">
          <Orbit className="w-5 h-5 text-nebula-cyan animate-orbit-spin-slow" />
          <h2 className="text-xs uppercase tracking-widest font-mono text-starlight-300 font-semibold">
            Orbital Spheres & Project Realms
          </h2>
        </div>
        <span className="text-[11px] font-mono text-starlight-300/60">
          Gravity Anchor: <span className="text-nebula-cyan capitalize">{activeCategory}</span>
        </span>
      </div>

      {/* Futuristic Floating Celestial Pills / Spheres */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-2">
        {categories.map((cat, idx) => {
          const isActive = activeCategory === cat.id;
          const count = taskCounts[cat.id] || 0;

          // Float animation class cycling
          const floatClass =
            idx % 3 === 0
              ? 'float-element-1'
              : idx % 3 === 1
              ? 'float-element-2'
              : 'float-element-3';

          return (
            <button
              id={`category-sphere-${cat.id}`}
              data-category={cat.id}
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`group relative p-3 rounded-2xl transition-all duration-500 text-left border ${floatClass} ${
                isActive
                  ? 'bg-space-800/80 border-cyan-400/60 shadow-[0_0_25px_rgba(56,189,248,0.35)] scale-105'
                  : 'bg-space-900/50 border-white/5 hover:border-white/20 hover:bg-space-850/70 hover:scale-[1.03]'
              }`}
            >
              {/* Outer faint orbital ring for active item */}
              {isActive && (
                <div className="absolute -inset-[2px] rounded-2xl bg-gradient-to-r from-cyan-500/30 via-purple-500/20 to-pink-500/30 blur-sm -z-10 animate-pulse" />
              )}

              <div className="flex items-start justify-between mb-2">
                {/* Planet Sphere Icon */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform group-hover:rotate-12 duration-300 ${cat.bgGlow} shadow-lg`}
                >
                  <span className="text-base">{cat.emoji}</span>
                </div>
                
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                    isActive
                      ? 'bg-cyan-500/20 border-cyan-400/40 text-cyan-200'
                      : 'bg-white/5 border-white/10 text-starlight-300/70'
                  }`}
                >
                  {count}
                </span>
              </div>

              <div className="space-y-0.5">
                <p className={`text-xs font-semibold tracking-wide truncate ${isActive ? 'text-white' : 'text-starlight-200'}`}>
                  {cat.label}
                </p>
                <p className="text-[10px] text-starlight-300/50 font-mono truncate">
                  {cat.sub}
                </p>
              </div>

              {/* Glowing bottom line indicator */}
              <div
                className={`mt-2 h-[2px] rounded-full transition-all duration-300 ${
                  isActive
                    ? 'w-full bg-gradient-to-r from-nebula-cyan to-nebula-purple'
                    : 'w-0 group-hover:w-1/2 bg-white/20'
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};
