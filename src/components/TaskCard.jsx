import React, { useState, useRef } from 'react';
import {
  Check,
  Trash2,
  Calendar,
  Tag,
  ChevronDown,
  ChevronUp,
  Maximize2,
  GripVertical,
  Plus,
  Clock,
  Sparkles,
  Flame,
  FileText
} from 'lucide-react';
import { particleDisintegrator } from '../utils/particleDisintegrator';
import { soundManager } from '../utils/audio';

export const TaskCard = ({
  task,
  onToggleComplete,
  onDelete,
  onUpdateTask,
  onEnterFocusMode,
  index,
  onDragStart,
  onDragOver,
  onDrop,
  isFocused = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [subtaskInput, setSubtaskInput] = useState('');
  const [notes, setNotes] = useState(task.notes || '');
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);

  const priorityGlow = {
    supernova: {
      border: 'hover:border-rose-500/50',
      badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.3)]',
      glowDot: 'bg-rose-500 shadow-[0_0_8px_#f43f5e]',
      accentColor: '#f43f5e',
    },
    nebula: {
      border: 'hover:border-cyan-400/50',
      badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-400/30 shadow-[0_0_10px_rgba(56,189,248,0.3)]',
      glowDot: 'bg-cyan-400 shadow-[0_0_8px_#38bdf8]',
      accentColor: '#38bdf8',
    },
    starlight: {
      border: 'hover:border-slate-400/30',
      badge: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
      glowDot: 'bg-slate-300 shadow-[0_0_6px_#cbd5e1]',
      accentColor: '#cbd5e1',
    },
  }[task.priority || 'nebula'];

  const handleCompleteClick = (e) => {
    e.stopPropagation();
    if (!task.completed && cardRef.current) {
      // Trigger glowing particle disintegration stardust animation
      particleDisintegrator.explode(cardRef.current, priorityGlow.accentColor);
      soundManager.playChime('complete');
    }
    onToggleComplete(task.id);
  };

  const handleAddSubtask = (e) => {
    e.preventDefault();
    if (!subtaskInput.trim()) return;
    const newSubtasks = [
      ...(task.subtasks || []),
      { id: 'sub_' + Date.now(), text: subtaskInput.trim(), completed: false },
    ];
    onUpdateTask(task.id, { subtasks: newSubtasks });
    setSubtaskInput('');
  };

  const toggleSubtask = (subId) => {
    const updated = (task.subtasks || []).map((s) =>
      s.id === subId ? { ...s, completed: !s.completed } : s
    );
    onUpdateTask(task.id, { subtasks: updated });
  };

  const handleSaveNotes = () => {
    onUpdateTask(task.id, { notes });
  };

  // Inertial Floating delay
  const floatDelay = `${(index % 4) * 0.4}s`;

  return (
    <div
      ref={cardRef}
      draggable={!isFocused}
      onDragStart={(e) => onDragStart && onDragStart(e, index)}
      onDragOver={(e) => onDragOver && onDragOver(e, index)}
      onDrop={(e) => onDrop && onDrop(e, index)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ animationDelay: floatDelay }}
      className={`group relative rounded-2xl p-4 transition-all duration-300 glass-card cursor-default ${
        priorityGlow.border
      } ${
        task.completed
          ? 'opacity-60 grayscale-[40%]'
          : 'opacity-100 hover:shadow-[0_20px_45px_rgba(0,0,0,0.6)]'
      } ${isFocused ? 'scale-105 shadow-[0_0_50px_rgba(56,189,248,0.3)]' : ''}`}
    >
      {/* Dynamic Cosmic Rim Glow on Hover */}
      <div
        className={`absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-transparent via-cyan-400/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none -z-10`}
      />

      <div className="flex items-start gap-3.5">
        {/* Drag handle */}
        {!isFocused && (
          <div
            className="cursor-grab active:cursor-grabbing text-starlight-300/30 hover:text-cyan-400 transition-colors pt-1"
            title="Drag with zero-gravity inertia"
          >
            <GripVertical className="w-4 h-4" />
          </div>
        )}

        {/* Completion Checkmark with Cosmic Stardust Trigger */}
        <button
          onClick={handleCompleteClick}
          className={`mt-0.5 w-6 h-6 rounded-full border flex items-center justify-center transition-all duration-300 relative ${
            task.completed
              ? 'bg-gradient-to-tr from-cyan-400 to-purple-500 border-transparent shadow-[0_0_15px_rgba(56,189,248,0.5)]'
              : 'border-white/20 bg-space-900/60 hover:border-cyan-400/80 hover:scale-110'
          }`}
          title={task.completed ? 'Mark incomplete' : 'Disintegrate task into stardust'}
        >
          {task.completed && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
        </button>

        {/* Task Title & Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3
              className={`text-sm md:text-base font-medium transition-all ${
                task.completed
                  ? 'line-through text-starlight-300/50'
                  : 'text-white group-hover:text-cyan-100'
              }`}
            >
              {task.title}
            </h3>

            {/* Quick Actions (Focus deep space mode, expand notes, delete) */}
            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
              {!isFocused && onEnterFocusMode && (
                <button
                  onClick={() => onEnterFocusMode(task)}
                  className="p-1.5 rounded-lg text-starlight-300/50 hover:text-cyan-300 hover:bg-white/5 transition-all"
                  title="Focus Deep Space Mode"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-lg text-starlight-300/50 hover:text-white hover:bg-white/5 transition-all"
                title="Expand notes & subtasks"
              >
                {isExpanded ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(task.id);
                }}
                className="p-1.5 rounded-lg text-starlight-300/40 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                title="De-orbit task"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Badges / Metadata row */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {/* Priority Glow Badge */}
            <span
              className={`inline-flex items-center gap-1.5 text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full border ${priorityGlow.badge}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${priorityGlow.glowDot}`} />
              {task.priority || 'nebula'}
            </span>

            {/* Due Date */}
            {task.dueDate && (
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-starlight-300/70 bg-white/5 border border-white/5 px-2 py-0.5 rounded-full">
                <Clock className="w-3 h-3 text-cyan-400" />
                {task.dueDate}
              </span>
            )}

            {/* Tags */}
            {task.tags &&
              task.tags.map((tag, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 text-[10px] font-mono text-purple-300/80 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full"
                >
                  #{tag}
                </span>
              ))}

            {/* Subtask count overview */}
            {task.subtasks && task.subtasks.length > 0 && (
              <span className="text-[10px] font-mono text-starlight-300/50 ml-auto">
                {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length} steps
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Expandable Glass Drawer for Notes & Subtasks */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-white/10 space-y-4 animate-in fade-in duration-300">
          {/* Subtasks Section */}
          <div className="space-y-2">
            <p className="text-[11px] uppercase tracking-wider font-mono text-cyan-300/70 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" /> Sub-Missions & Micro-Steps
            </p>

            <div className="space-y-1.5 pl-1">
              {(task.subtasks || []).map((sub) => (
                <div
                  key={sub.id}
                  onClick={() => toggleSubtask(sub.id)}
                  className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-white/5 cursor-pointer text-xs transition-colors"
                >
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                      sub.completed
                        ? 'bg-cyan-500/30 border-cyan-400 text-cyan-300'
                        : 'border-white/20'
                    }`}
                  >
                    {sub.completed && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span
                    className={`${
                      sub.completed ? 'line-through text-starlight-300/40' : 'text-starlight-100'
                    }`}
                  >
                    {sub.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Add Subtask Input */}
            <form onSubmit={handleAddSubtask} className="flex gap-2 pt-1">
              <input
                type="text"
                value={subtaskInput}
                onChange={(e) => setSubtaskInput(e.target.value)}
                placeholder="Add next orbital step..."
                className="flex-1 bg-space-950/60 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-starlight-300/40 focus:outline-none focus:border-cyan-400/50"
              />
              <button
                type="submit"
                disabled={!subtaskInput.trim()}
                className="px-3 py-1.5 rounded-xl text-xs bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 disabled:opacity-40"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Notes Section */}
          <div className="space-y-1.5">
            <p className="text-[11px] uppercase tracking-wider font-mono text-purple-300/70 flex items-center gap-1.5">
              <FileText className="w-3 h-3" /> Mission Logs & Notes
            </p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={handleSaveNotes}
              rows={2}
              placeholder="Record deep space reflections, coordinates, or mission logs here..."
              className="w-full bg-space-950/60 border border-white/10 rounded-xl p-2.5 text-xs text-starlight-100 placeholder-starlight-300/40 focus:outline-none focus:border-purple-400/50 resize-y"
            />
          </div>
        </div>
      )}
    </div>
  );
};
