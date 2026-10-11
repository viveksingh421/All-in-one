import React, { useState, useEffect } from 'react';
import { StarfieldCanvas } from './components/StarfieldCanvas';
import { CommandBar } from './components/CommandBar';
import { OrbitSpheres } from './components/OrbitSpheres';
import { TaskCard } from './components/TaskCard';
import { SoundPlayer } from './components/SoundPlayer';
import { DeepSpaceFocusModal } from './components/DeepSpaceFocusModal';
import { FocusStopwatch } from './components/FocusStopwatch';
import { PdfDocumentHub } from './components/PdfDocumentHub';
import { GeminiVibeGenerator } from './components/GeminiVibeGenerator';
import { WorkspaceModeSwitcher, WORKSPACE_MODES } from './components/WorkspaceModeSwitcher';
import {
  Sparkles,
  Maximize2,
  Minimize2,
  Filter,
  Globe2,
  BookOpen,
  Code2,
  Compass,
  CheckCircle2,
  Flame,
  LayoutGrid
} from 'lucide-react';

const INITIAL_CATEGORIES = [
  { id: 'all', label: 'Cosmos (All)', sub: 'Full orbit', emoji: '🌌', bgGlow: 'bg-cyan-500/20' },
  { id: 'missions', label: 'Missions', sub: 'Active goals', emoji: '🚀', bgGlow: 'bg-indigo-500/20' },
  { id: 'orbital', label: 'Orbital Tech', sub: 'Code & engineering', emoji: '🛸', bgGlow: 'bg-purple-500/20' },
  { id: 'nebula', label: 'Nebula Flow', sub: 'Creative & ideas', emoji: '✨', bgGlow: 'bg-pink-500/20' },
  { id: 'deep-space', label: 'Deep Space', sub: 'Research & long-term', emoji: '🪐', bgGlow: 'bg-amber-500/20' },
  { id: 'stellar', label: 'Stellar Routine', sub: 'Daily habits', emoji: '⭐', bgGlow: 'bg-emerald-500/20' },
];

const INITIAL_TASKS = [
  {
    id: 'task-1',
    title: 'Architect zero-gravity orbital navigation layout for AetherTasks',
    category: 'missions',
    priority: 'supernova',
    completed: false,
    dueDate: '2026-10-15',
    tags: ['ui', 'celestial', 'core'],
    notes: 'Ensure 60fps buttery smooth CSS floating animations and multi-layered glassmorphism.',
    subtasks: [
      { id: 's1', text: 'Calibrate backdrop-blur & translucent borders', completed: true },
      { id: 's2', text: 'Implement Web Audio cosmic drone sound engine', completed: true },
      { id: 's3', text: 'Tune particle stardust disintegration physics', completed: false },
    ],
  },
  {
    id: 'task-2',
    title: 'Synthesize cosmic binaural soundscapes & white noise generators',
    category: 'orbital',
    priority: 'nebula',
    completed: false,
    dueDate: '2026-10-18',
    tags: ['audio', 'synthesis'],
    notes: 'Harmonic 528Hz celestial frequencies with slow LFO detuning.',
    subtasks: [],
  },
  {
    id: 'task-3',
    title: 'Configure Warp Chrono pomodoro for deep space focus chamber',
    category: 'deep-space',
    priority: 'nebula',
    completed: false,
    dueDate: '2026-10-20',
    tags: ['zen', 'chrono'],
    notes: 'Provides a tranquil, distraction-free environment for uninterrupted creation.',
    subtasks: [],
  },
  {
    id: 'task-4',
    title: 'Daily stardust calibration and star-chart alignment',
    category: 'stellar',
    priority: 'starlight',
    completed: true,
    dueDate: null,
    tags: ['routine'],
    notes: 'Regular check-in across active orbital project spheres.',
    subtasks: [],
  },
];

export default function App() {
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem('aether_tasks_v1');
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  });

  const [activeCategory, setActiveCategory] = useState('all');
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'pending' | 'completed'
  const [priorityFilter, setPriorityFilter] = useState('all'); // 'all' | 'supernova' | 'nebula' | 'starlight'
  const [focusTask, setFocusTask] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);

  // Celestial Zoom Focus for Space Objects: null | 'tasks' | 'docs' | 'stopwatch' | 'vibe'
  const [zoomedObject, setZoomedObject] = useState(null);
  const [activeWorkspaceMode, setActiveWorkspaceMode] = useState('coding');

  // Listen to Escape key to smoothly zoom back out to outer space
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && zoomedObject) {
        setZoomedObject(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoomedObject]);

  // Handle celestial object auto zoom on click
  const handleToggleZoom = (objectId) => {
    setZoomedObject((prev) => (prev === objectId ? null : objectId));
  };

  // Persistent storage in localStorage
  useEffect(() => {
    try {
      localStorage.setItem('aether_tasks_v1', JSON.stringify(tasks));
    } catch (e) {
      console.error('Storage error', e);
    }
  }, [tasks]);

  // Current workspace mode metadata
  const currentModeMeta =
    WORKSPACE_MODES.find((m) => m.id === activeWorkspaceMode) || WORKSPACE_MODES[1];

  // Task Handlers
  const handleAddTask = (newTaskData) => {
    const newTask = {
      id: 'task-' + Date.now(),
      completed: false,
      subtasks: [],
      notes: '',
      ...newTaskData,
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleToggleComplete = (taskId) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
    if (focusTask && focusTask.id === taskId) {
      setFocusTask((curr) => ({ ...curr, completed: !curr.completed }));
    }
  };

  const handleDeleteTask = (taskId) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (focusTask && focusTask.id === taskId) {
      setFocusTask(null);
    }
  };

  const handleUpdateTask = (taskId, updates) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t))
    );
    if (focusTask && focusTask.id === taskId) {
      setFocusTask((curr) => ({ ...curr, ...updates }));
    }
  };

  // Drag and Drop Zero-Gravity Inertial Sorting
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    setTasks((prev) => {
      const cloned = [...prev];
      const [draggedItem] = cloned.splice(draggedIndex, 1);
      cloned.splice(targetIndex, 0, draggedItem);
      return cloned;
    });
    setDraggedIndex(null);
  };

  // Task Counts per sphere
  const taskCounts = tasks.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + 1;
    acc['all'] = (acc['all'] || 0) + 1;
    return acc;
  }, {});

  // Filtered task collection
  const filteredTasks = tasks.filter((t) => {
    if (activeCategory !== 'all' && t.category !== activeCategory) return false;
    if (filterMode === 'pending' && t.completed) return false;
    if (filterMode === 'completed' && !t.completed) return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    return true;
  });

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div
      className="relative min-h-screen text-starlight-100 selection:bg-cyan-500/30 selection:text-white pb-24 font-sans transition-all duration-700"
      style={{
        backgroundImage: currentModeMeta.ambientGradient,
      }}
    >
      {/* Dynamic Starfield with particle speed keyed to workspace mode */}
      <StarfieldCanvas speedMultiplier={currentModeMeta.speed} />

      {/* Floating Header */}
      <header
        className={`sticky top-0 z-40 w-full backdrop-blur-xl bg-space-950/60 border-b border-white/10 transition-all duration-500 ${
          zoomedObject ? 'opacity-20 blur-xs pointer-events-none' : 'opacity-100'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-500 p-[1.5px] shadow-[0_0_25px_rgba(56,189,248,0.4)]">
              <div className="w-full h-full bg-space-950 rounded-[14px] flex items-center justify-center">
                <Globe2 className="w-5 h-5 text-cyan-400 animate-orbit-spin-slow" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-white">
                  Float
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300">
                  Spatial Study Hub v3.0
                </span>
              </div>
              <p className="text-[10px] font-mono text-starlight-300/60 hidden sm:block">
                Zero-Gravity Focus Workspace • Mode: {currentModeMeta.label}
              </p>
            </div>
          </div>

          {/* Right cluster */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono">
              <span className="text-starlight-300/70">Orbit Completion:</span>
              <span className="text-cyan-300 font-semibold">{progressPercent}%</span>
              <div className="w-14 h-1.5 rounded-full bg-space-900 border border-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <SoundPlayer />
          </div>
        </div>
      </header>

      {/* Main Celestial Space Viewport */}
      <main className={`relative max-w-7xl mx-auto px-4 sm:px-6 pt-6 transition-all ${zoomedObject ? 'z-40' : 'z-10'}`}>
        {/* Orbital Spheres / Realms Station */}
        <div
          className={`transition-all duration-500 mb-8 ${
            zoomedObject && zoomedObject !== 'spheres' ? 'opacity-20 blur-sm pointer-events-none' : 'opacity-100'
          }`}
        >
          <OrbitSpheres
            categories={INITIAL_CATEGORIES}
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
            taskCounts={taskCounts}
          />
        </div>

        {/* Deep Space Orbit Navigation Info */}
        <div className="flex items-center justify-between text-xs font-mono text-starlight-300/50 px-2 pb-6">
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            Celestial Deep Space System • Click any planetary sphere to enter its world • Esc to return
          </span>
          <span className="hidden sm:inline text-starlight-300/40">
            Coordinates: Sector-Alpha • Gravity: Zero
          </span>
        </div>

        {/* GENUINE CELESTIAL PLANETARY GALAXY (Deep Space Roaming Map) */}
        <div className="relative min-h-[780px] w-full my-4 overflow-hidden rounded-3xl border border-white/5 bg-space-950/40 backdrop-blur-xs p-6 shadow-inner">
          {/* Faint Orbital Elliptical Trajectory Lines connecting the cosmos */}
          <div className="absolute inset-x-8 top-12 bottom-12 rounded-full border border-dashed border-cyan-400/10 pointer-events-none -rotate-6" />
          <div className="absolute inset-x-20 top-24 bottom-24 rounded-full border border-dotted border-purple-400/10 pointer-events-none rotate-12" />

          {/* TOP CENTER ROAMING PLANET: To-Do Citadel Sphere */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 celestial-roam-top-center z-10">
            <div className="flex flex-col items-center">
              <div
                id="celestial-todo-planet"
                onClick={() => setZoomedObject('tasks')}
                className="celestial-planet-sphere w-48 h-48 sm:w-56 sm:h-56 relative group cursor-pointer transition-transform duration-500 hover:scale-110 active:scale-95"
              >
                {/* Planetary Orbital Dashed Rings */}
                <div className="celestial-orbit-circular-ring border-cyan-400/35 group-hover:border-cyan-400/70" />
                <div className="celestial-orbit-outer-ring border-purple-400/25 group-hover:border-purple-400/50" />

                {/* 3D Atmospheric Glowing Aura */}
                <div className="celestial-sphere-glow bg-cyan-500/25 group-hover:bg-cyan-400/40" />

                {/* 3D Planet Surface Texture */}
                <div className="w-full h-full rounded-full bg-gradient-to-br from-cyan-400 via-indigo-700 to-space-950 p-1 shadow-[0_0_60px_rgba(56,189,248,0.4),inset_0_10px_25px_rgba(255,255,255,0.4),inset_0_-15px_30px_rgba(0,0,0,0.8)] border border-cyan-300/40 flex flex-col items-center justify-center text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.25),transparent_60%)] pointer-events-none" />
                  <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-cyan-200 mb-2 shadow-inner group-hover:rotate-12 transition-transform duration-300">
                    <Sparkles className="w-6 h-6 animate-pulse" />
                  </div>
                  <h3 className="text-sm font-semibold tracking-wide text-white drop-shadow-md">
                    To-Do Citadel
                  </h3>
                  <span className="text-[10px] font-mono text-cyan-200/80 mt-0.5">
                    {tasks.filter((t) => !t.completed).length} Active Missions
                  </span>
                  <span className="text-[9px] font-mono uppercase tracking-widest text-cyan-300/80 mt-1.5 px-2.5 py-0.5 rounded-full bg-cyan-400/10 border border-cyan-400/30">
                    Click to Enter World
                  </span>
                </div>

                {/* Orbiting Tiny Satellite */}
                <div className="absolute -top-3 right-4 w-4 h-4 rounded-full bg-gradient-to-tr from-cyan-300 to-indigo-400 shadow-[0_0_12px_#38bdf8] animate-bounce" />
              </div>
              <p className="text-[11px] font-mono text-cyan-300/60 mt-3 tracking-widest uppercase">
                Sector 01 • To-Do World
              </p>
            </div>
          </div>

          {/* MID-LEFT ROAMING PLANET: Orbital Archive Hub (PDFs) */}
          <div className="absolute top-[38%] left-4 sm:left-12 celestial-roam-mid-left z-10">
            <div className="flex flex-col items-center">
              <div
                id="celestial-docs-planet"
                onClick={() => setZoomedObject('docs')}
                className="celestial-planet-sphere w-36 h-36 sm:w-44 sm:h-44 relative group cursor-pointer transition-transform duration-500 hover:scale-110 active:scale-95"
              >
                <div className="celestial-orbit-circular-ring border-purple-400/30 group-hover:border-purple-400/60" />
                <div className="celestial-sphere-glow bg-purple-600/25 group-hover:bg-purple-500/40" />

                <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-500 via-purple-900 to-space-950 p-1 shadow-[0_0_45px_rgba(168,85,247,0.35),inset_0_8px_20px_rgba(255,255,255,0.3),inset_0_-12px_25px_rgba(0,0,0,0.8)] border border-purple-300/30 flex flex-col items-center justify-center text-center relative overflow-hidden">
                  <BookOpen className="w-5 h-5 text-purple-200 mb-1" />
                  <h4 className="text-xs font-semibold text-white tracking-wide">
                    Archive Hub
                  </h4>
                  <span className="text-[9px] font-mono text-purple-200/80">PDFs & Notes</span>
                  <span className="text-[8px] font-mono text-purple-300/70 mt-1 px-2 py-0.5 rounded-full bg-purple-400/10 border border-purple-400/20">
                    Enter Archive
                  </span>
                </div>
              </div>
              <p className="text-[10px] font-mono text-purple-300/60 mt-2.5 tracking-wider uppercase">
                Sector 02 • Archive World
              </p>
            </div>
          </div>

          {/* MID-RIGHT ROAMING PLANET: Cosmic Vibes Audio Nexus */}
          <div className="absolute top-[32%] right-4 sm:right-16 celestial-roam-mid-right z-10">
            <div className="flex flex-col items-center">
              <div
                id="celestial-vibe-planet"
                onClick={() => setZoomedObject('vibe')}
                className="celestial-planet-sphere w-36 h-36 sm:w-44 sm:h-44 relative group cursor-pointer transition-transform duration-500 hover:scale-110 active:scale-95"
              >
                <div className="celestial-orbit-circular-ring border-pink-400/30 group-hover:border-pink-400/60" />
                <div className="celestial-sphere-glow bg-pink-600/25 group-hover:bg-pink-500/40" />

                <div className="w-full h-full rounded-full bg-gradient-to-br from-pink-500 via-rose-900 to-space-950 p-1 shadow-[0_0_45px_rgba(244,114,182,0.35),inset_0_8px_20px_rgba(255,255,255,0.3),inset_0_-12px_25px_rgba(0,0,0,0.8)] border border-pink-300/30 flex flex-col items-center justify-center text-center relative overflow-hidden">
                  <Flame className="w-5 h-5 text-pink-200 mb-1" />
                  <h4 className="text-xs font-semibold text-white tracking-wide">
                    Vibe Nexus
                  </h4>
                  <span className="text-[9px] font-mono text-pink-200/80">Soundscapes</span>
                  <span className="text-[8px] font-mono text-pink-300/70 mt-1 px-2 py-0.5 rounded-full bg-pink-400/10 border border-pink-400/20">
                    Enter Nexus
                  </span>
                </div>
              </div>
              <p className="text-[10px] font-mono text-pink-300/60 mt-2.5 tracking-wider uppercase">
                Sector 03 • Soundscape World
              </p>
            </div>
          </div>

          {/* BOTTOM RIGHT ROAMING PLANET: Stopwatch Chrono Sphere */}
          <div className="absolute bottom-6 right-6 sm:right-16 celestial-roam-bottom-right z-10">
            <div className="flex flex-col items-center">
              <div
                id="celestial-stopwatch-planet"
                onClick={() => setZoomedObject('stopwatch')}
                className="celestial-planet-sphere w-44 h-44 sm:w-56 sm:h-56 relative group cursor-pointer transition-transform duration-500 hover:scale-110 active:scale-95"
              >
                {/* Orbital Rings */}
                <div className="celestial-orbit-circular-ring border-cyan-400/40 group-hover:border-cyan-400/70" />
                <div className="celestial-orbit-outer-ring border-indigo-400/30 group-hover:border-indigo-400/60" />

                {/* Glowing Plasma Atmosphere */}
                <div className="celestial-sphere-glow bg-cyan-600/30 group-hover:bg-cyan-500/45" />

                {/* 3D Planet Body */}
                <div className="w-full h-full rounded-full bg-gradient-to-br from-cyan-400 via-teal-800 to-space-950 p-1 shadow-[0_0_55px_rgba(56,189,248,0.45),inset_0_10px_25px_rgba(255,255,255,0.4),inset_0_-15px_30px_rgba(0,0,0,0.85)] border border-cyan-300/40 flex flex-col items-center justify-center text-center relative overflow-hidden">
                  <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-cyan-200 mb-1.5 shadow-inner group-hover:rotate-45 transition-transform duration-300">
                    <Globe2 className="w-5 h-5 text-cyan-300 animate-spin-slow" />
                  </div>
                  <h3 className="text-sm font-semibold tracking-wide text-white drop-shadow-md">
                    Chrono Sphere
                  </h3>
                  <span className="text-[10px] font-mono text-cyan-200/90 mt-0.5">
                    Orbital Stopwatch
                  </span>
                  <span className="text-[9px] font-mono uppercase tracking-widest text-cyan-300/80 mt-1.5 px-2.5 py-0.5 rounded-full bg-cyan-400/10 border border-cyan-400/30">
                    Click to Enter World
                  </span>
                </div>

                {/* Orbiting Chrono Satellite */}
                <div className="absolute bottom-2 -left-2 w-4 h-4 rounded-full bg-gradient-to-tr from-cyan-200 to-teal-400 shadow-[0_0_12px_#38bdf8] animate-pulse" />
              </div>
              <p className="text-[11px] font-mono text-cyan-300/60 mt-3 tracking-widest uppercase">
                Sector 04 • Stopwatch World
              </p>
            </div>
          </div>
        </div>

        {/* FULLSCREEN ZOOM PORTAL: When any celestial body is clicked, it zooms onto full screen cleanly without resizing inner elements */}
        {zoomedObject && (
          <div
            onClick={() => setZoomedObject(null)}
            className="celestial-zoomed-fullscreen"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto custom-scrollbar p-2"
            >
              {/* Floating Return Button */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span className="text-xs font-mono uppercase tracking-widest text-cyan-300 font-semibold">
                    {zoomedObject === 'tasks' && 'Primary Mission Citadel — Focused Space View'}
                    {zoomedObject === 'docs' && 'Orbital Archive Hub — Focused Space View'}
                    {zoomedObject === 'stopwatch' && 'Orbital Chrono — Focused Space View'}
                    {zoomedObject === 'vibe' && 'Cosmic Sound & Study Vibes — Focused Space View'}
                  </span>
                </div>
                <button
                  onClick={() => setZoomedObject(null)}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-mono flex items-center gap-1.5 border border-white/20 transition-all cursor-pointer shadow-lg"
                  title="Close Zoomed View (Esc)"
                >
                  <Minimize2 className="w-3.5 h-3.5 text-cyan-300" />
                  <span>Return to Space (Esc)</span>
                </button>
              </div>

              {/* Render Focused Station at original natural size */}
              <div className="relative">
                {zoomedObject === 'tasks' && (
                  <div className="glass-panel rounded-3xl p-6 border border-cyan-400/30 shadow-[0_30px_80px_rgba(0,0,0,0.8)]">
                    <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-cyan-300">
                          <Sparkles className="w-4 h-4 animate-pulse" />
                        </div>
                        <div>
                          <h2 className="text-sm font-semibold text-white tracking-wide">
                            Primary Mission Citadel
                          </h2>
                          <p className="text-[10px] text-starlight-300/60 font-mono">
                            Zero-Gravity Task Orchestrator
                          </p>
                        </div>
                      </div>
                    </div>

                    <CommandBar
                      onAddTask={handleAddTask}
                      categories={INITIAL_CATEGORIES.filter((c) => c.id !== 'all')}
                    />

                    <div className="mb-4 flex items-center justify-between flex-wrap gap-2 px-1 text-xs">
                      <div className="flex items-center gap-1.5">
                        <Filter className="w-3.5 h-3.5 text-starlight-300/60" />
                        <span className="font-mono text-starlight-300/70 text-[11px]">Orbit:</span>
                        <div className="flex bg-space-900/60 p-0.5 rounded-xl border border-white/10 text-[11px]">
                          {(['all', 'pending', 'completed']).map((mode) => (
                            <button
                              key={mode}
                              onClick={() => setFilterMode(mode)}
                              className={`px-2.5 py-0.5 rounded-lg capitalize transition-all ${
                                filterMode === mode
                                  ? 'bg-cyan-500/20 text-cyan-300 shadow-sm border border-cyan-400/30'
                                  : 'text-starlight-300/60 hover:text-white'
                              }`}
                            >
                              {mode}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px]">
                        <span className="text-starlight-300/60 font-mono">Gravity:</span>
                        <select
                          value={priorityFilter}
                          onChange={(e) => setPriorityFilter(e.target.value)}
                          className="bg-space-900/60 border border-white/10 text-starlight-100 rounded-xl px-2 py-0.5 text-[11px] focus:outline-none focus:border-cyan-400/40"
                        >
                          <option value="all">All Gravities</option>
                          <option value="supernova">Supernova Only</option>
                          <option value="nebula">Nebula Only</option>
                          <option value="starlight">Starlight Only</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
                      {filteredTasks.length === 0 ? (
                        <div className="glass-card text-center py-12 px-6 rounded-2xl border border-white/10 space-y-2">
                          <Sparkles className="w-6 h-6 mx-auto text-cyan-300 animate-pulse" />
                          <h3 className="font-serif text-base text-white">This Orbit is Weightless and Clear</h3>
                          <p className="text-xs text-starlight-300/60">
                            No active tasks in this quadrant. Launch a new task with the command bar above.
                          </p>
                        </div>
                      ) : (
                        filteredTasks.map((task, index) => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            index={index}
                            onToggleComplete={handleToggleComplete}
                            onDelete={handleDeleteTask}
                            onUpdateTask={handleUpdateTask}
                            onEnterFocusMode={setFocusTask}
                            onDragStart={handleDragStart}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                          />
                        ))
                      )}
                    </div>
                  </div>
                )}

                {zoomedObject === 'docs' && <PdfDocumentHub />}
                {zoomedObject === 'stopwatch' && <FocusStopwatch />}
                {zoomedObject === 'vibe' && <GeminiVibeGenerator />}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* CORNER ACCENT: Dynamic Workspace Mode Switcher */}
      <WorkspaceModeSwitcher
        activeMode={activeWorkspaceMode}
        onSelectMode={setActiveWorkspaceMode}
      />

      {/* Focus Deep Space Modal */}
      {focusTask && (
        <DeepSpaceFocusModal
          task={focusTask}
          onClose={() => setFocusTask(null)}
          onToggleComplete={handleToggleComplete}
          onUpdateTask={handleUpdateTask}
        />
      )}
    </div>
  );
}
