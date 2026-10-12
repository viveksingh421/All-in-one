import React, { useState } from 'react';
import { Plus, Calendar, Tag, Flame, ShieldAlert, Sparkles, Command } from 'lucide-react';
import { soundManager } from '../utils/audio';

export const CommandBar = ({ onAddTask, categories }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('missions');
  const [priority, setPriority] = useState('nebula'); // 'starlight' | 'nebula' | 'supernova'
  const [dueDate, setDueDate] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    soundManager.playChime('add');

    onAddTask({
      title: title.trim(),
      category,
      priority,
      dueDate: dueDate || null,
      tags: tagInput
        ? tagInput.split(',').map((t) => t.trim()).filter(Boolean)
        : [],
    });

    setTitle('');
    setTagInput('');
    setDueDate('');
    setIsExpanded(false);
  };

  const priorityMeta = {
    starlight: {
      label: 'Starlight (Low)',
      color: 'text-slate-300 border-slate-500/40 bg-slate-500/10',
      glow: 'shadow-[0_0_10px_rgba(203,213,225,0.2)]',
    },
    nebula: {
      label: 'Nebula (Normal)',
      color: 'text-nebula-cyan border-cyan-400/50 bg-cyan-500/10',
      glow: 'shadow-[0_0_12px_rgba(56,189,248,0.25)]',
    },
    supernova: {
      label: 'Supernova (Urgent)',
      color: 'text-rose-400 border-rose-500/60 bg-rose-500/15',
      glow: 'shadow-[0_0_15px_rgba(244,63,94,0.35)]',
    },
  };

  return (
    <div className="w-full mx-auto mb-6">
      <div className="glass-panel p-2.5 rounded-2xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.6)] hover:border-cyan-400/40 transition-all duration-500 group">
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Main Raycast-style Input Bar */}
          <div className="flex items-center gap-4 px-4 py-3.5">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 border border-white/15 text-nebula-cyan shadow-inner">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>

            <input
              id="command-task-input"
              data-testid="task-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onFocus={() => setIsExpanded(true)}
              placeholder="Manifest a new task or mission into orbit... (e.g., Deploy lunar telemetry subsystem)"
              className="flex-1 bg-transparent border-none text-lg md:text-xl text-white placeholder-starlight-300/60 focus:outline-none font-sans font-medium"
            />

            <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs sm:text-sm font-mono text-starlight-300 font-semibold">
              <Command className="w-4 h-4" />
              <span>Enter to launch</span>
            </div>

            <button
              id="command-task-submit"
              data-testid="task-submit-btn"
              type="submit"
              aria-label="Launch task"
              disabled={!title.trim()}
              className="px-6 py-3 rounded-xl text-base font-bold bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-[0_0_20px_rgba(56,189,248,0.35)] disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              <span>Launch</span>
            </button>
          </div>

          {/* Expanded Drawer for Cosmic Metadata */}
          {isExpanded && (
            <div className="pt-3 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3 px-2 pb-1 animate-in fade-in duration-300">
              {/* Category Picker */}
              <div>
                <label className="text-xs uppercase tracking-wider font-mono text-starlight-200 block mb-1.5 font-bold">
                  Target Sphere
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-space-900/90 border border-white/15 text-starlight-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-cyan-400 font-sans"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id} className="bg-space-900 text-white">
                      {c.emoji} {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority Picker */}
              <div>
                <label className="text-xs uppercase tracking-wider font-mono text-starlight-200 block mb-1.5 font-bold">
                  Gravitational Pull (Priority)
                </label>
                <div className="flex gap-1.5">
                  {(['starlight', 'nebula', 'supernova']).map((lvl) => {
                    const isSelected = priority === lvl;
                    return (
                      <button
                        type="button"
                        key={lvl}
                        onClick={() => setPriority(lvl)}
                        className={`flex-1 py-2 px-2.5 rounded-xl text-xs sm:text-sm font-semibold border capitalize transition-all ${
                          isSelected
                            ? `${priorityMeta[lvl].color} ${priorityMeta[lvl].glow}`
                            : 'bg-space-900/50 border-white/10 text-starlight-300 hover:border-white/20'
                        }`}
                      >
                        {lvl === 'supernova' ? 'Supernova' : lvl === 'nebula' ? 'Nebula' : 'Starlight'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Due Date & Quick Tags */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-xs uppercase tracking-wider font-mono text-starlight-200 block mb-1.5 font-bold">
                    Temporal Horizon
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-space-900/90 border border-white/15 text-starlight-100 rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs uppercase tracking-wider font-mono text-starlight-200 block mb-1.5 font-bold">
                    Tags (csv)
                  </label>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="ai, core, v2"
                    className="w-full bg-space-900/90 border border-white/15 text-starlight-100 rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
