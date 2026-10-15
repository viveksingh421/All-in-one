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

  // Live Chrono telemetry from localStorage
  const [chronoTelemetry, setChronoTelemetry] = useState(() => {
    try {
      const running = localStorage.getItem('aether_stopwatch_running') === 'true';
      const timeMs = parseInt(localStorage.getItem('aether_stopwatch_time_ms') || '0', 10);
      return { running, timeMs };
    } catch {
      return { running: false, timeMs: 0 };
    }
  });

  // Poll live stopwatch telemetry every second
  useEffect(() => {
    const pollInterval = setInterval(() => {
      try {
        const running = localStorage.getItem('aether_stopwatch_running') === 'true';
        const timeMs = parseInt(localStorage.getItem('aether_stopwatch_time_ms') || '0', 10);
        setChronoTelemetry({ running, timeMs });
      } catch {
        // ignore
      }
    }, 1000);
    return () => clearInterval(pollInterval);
  }, []);

  // Free interactive drag physics positions for each planet (offsets from anchor)
  const [planetOffsets, setPlanetOffsets] = useState({
    tasks: { x: 0, y: 0 },
    vibe: { x: 0, y: 0 },
    docs: { x: 0, y: 0 },
    stopwatch: { x: 0, y: 0 },
  });
  const [draggingPlanet, setDraggingPlanet] = useState(null);
  const dragStartRef = React.useRef({ x: 0, y: 0, startOffsetX: 0, startOffsetY: 0, didDrag: false });

  const handlePlanetMouseDown = (planetKey, e) => {
    // Only drag with left mouse button
    if (e.button !== 0) return;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startOffsetX: planetOffsets[planetKey]?.x || 0,
      startOffsetY: planetOffsets[planetKey]?.y || 0,
      didDrag: false,
    };
    setDraggingPlanet(planetKey);
  };

  useEffect(() => {
    if (!draggingPlanet) return;

    const handleMouseMove = (e) => {
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
        dragStartRef.current.didDrag = true;
      }
      setPlanetOffsets((prev) => ({
        ...prev,
        [draggingPlanet]: {
          x: dragStartRef.current.startOffsetX + dx,
          y: dragStartRef.current.startOffsetY + dy,
        },
      }));
    };

    const handleMouseUp = () => {
      setDraggingPlanet(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingPlanet]);

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
      className="relative h-screen w-screen overflow-hidden text-starlight-100 selection:bg-cyan-500/30 selection:text-white font-sans transition-all duration-700 flex flex-col"
      style={{
        backgroundImage: currentModeMeta.ambientGradient,
      }}
    >
      {/* Dynamic Starfield with particle speed keyed to workspace mode */}
      <StarfieldCanvas speedMultiplier={currentModeMeta.speed} />

      {/* Floating Header */}
      <header
        className={`shrink-0 z-40 w-full backdrop-blur-xl bg-space-950/70 border-b border-white/10 transition-all duration-500 py-1 sm:py-1.5 ${
          zoomedObject ? 'opacity-20 blur-xs pointer-events-none' : 'opacity-100'
        }`}
      >
        <div className="w-full px-3 sm:px-8 xl:px-12 h-14 sm:h-20 flex items-center justify-between">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <div className="relative w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-500 p-[2px] shadow-[0_0_30px_rgba(56,189,248,0.5)]">
              <div className="w-full h-full bg-space-950 rounded-[10px] sm:rounded-[14px] flex items-center justify-center">
                <Globe2 className="w-5 h-5 sm:w-7 sm:h-7 text-cyan-400 animate-orbit-spin-slow" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 sm:gap-3">
                <h1 className="font-serif text-xl sm:text-4xl font-black tracking-tight text-white drop-shadow-md">
                  Float
                </h1>
                <span className="text-[10px] sm:text-sm font-mono px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-bold">
                  v3.0
                </span>
              </div>
              <p className="text-[10px] sm:text-sm font-mono text-starlight-200 hidden sm:block mt-0.5 font-medium">
                Zero-Gravity Focus Workspace • Mode: <span className="text-cyan-300 font-bold">{currentModeMeta.label}</span>
              </p>
            </div>
          </div>

          {/* Right cluster */}
          <div className="flex items-center gap-2.5 sm:gap-5">
            <div className="hidden md:flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/5 border border-white/15 text-sm sm:text-base font-mono shadow-inner">
              <span className="text-starlight-200 font-semibold">Orbit Completion:</span>
              <span className="text-cyan-300 font-extrabold text-base sm:text-lg">{progressPercent}%</span>
              <div className="w-20 sm:w-24 h-2.5 rounded-full bg-space-900 border border-white/15 overflow-hidden">
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
      <main className={`relative w-full flex-1 min-h-0 px-2 sm:px-8 xl:px-12 py-1 sm:py-2 flex flex-col transition-all ${zoomedObject ? 'z-40' : 'z-10'}`}>
        {/* Deep Space Orbit Navigation Info */}
        <div className="flex items-center justify-between text-xs sm:text-base font-mono text-starlight-200 px-2 pb-1.5 flex-wrap gap-1.5 shrink-0">
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <strong className="text-white font-extrabold text-xs sm:text-base">Deep Space Orbits</strong> • Tap any planet to explore • Esc to return
          </span>
          <span className="hidden md:inline text-starlight-300/80 font-bold text-xs sm:text-sm">
            Sector-Alpha • Zero-G
          </span>
        </div>

        {/* GENUINE CELESTIAL PLANETARY GALAXY (Deep Space Roaming Map Fits 1 Screen) */}
        <div className="relative flex-1 min-h-0 w-full overflow-hidden rounded-3xl border border-white/10 bg-space-950/40 backdrop-blur-xs p-4 sm:p-6 shadow-inner">
          {/* Faint Orbital Elliptical Trajectory Lines connecting the cosmos */}
          <div className="absolute inset-x-8 top-12 bottom-12 rounded-full border border-dashed border-cyan-400/10 pointer-events-none -rotate-6" />
          <div className="absolute inset-x-20 top-24 bottom-24 rounded-full border border-dotted border-purple-400/10 pointer-events-none rotate-12" />

          {/* TOP-LEFT ROAMING PLANET: To-Do Citadel */}
          <div
            onMouseDown={(e) => handlePlanetMouseDown('tasks', e)}
            style={{
              transform: `translate(${planetOffsets.tasks.x}px, ${planetOffsets.tasks.y}px)`,
            }}
            className="absolute top-2 sm:top-6 left-2 sm:left-14 celestial-roam-top-left z-10 select-none cursor-grab active:cursor-grabbing"
          >
            <div className="flex flex-col items-center">
              <div
                id="celestial-todo-planet"
                onClick={() => {
                  if (!dragStartRef.current.didDrag) setZoomedObject('tasks');
                }}
                className="celestial-planet-sphere w-36 h-36 xs:w-44 xs:h-44 sm:w-56 sm:h-56 md:w-64 md:h-64 relative group transition-transform duration-500 hover:scale-105 active:scale-95"
              >
                {/* Planetary Orbital Dashed Rings */}
                <div className="celestial-orbit-circular-ring border-cyan-400/40 group-hover:border-cyan-400/75" />
                <div className="celestial-orbit-outer-ring border-purple-400/30 group-hover:border-purple-400/60" />

                {/* 3D Atmospheric Glowing Aura */}
                <div className="celestial-sphere-glow bg-cyan-500/30 group-hover:bg-cyan-400/50" />

                {/* 3D Planet Surface Texture */}
                <div className="w-full h-full rounded-full bg-gradient-to-br from-cyan-400 via-indigo-800 to-space-950 p-2.5 xs:p-3 sm:p-5 shadow-[0_0_80px_rgba(56,189,248,0.5),inset_0_15px_35px_rgba(255,255,255,0.45),inset_0_-18px_45px_rgba(0,0,0,0.9)] border border-cyan-300/40 flex flex-col items-center justify-center text-center relative overflow-hidden">
                  <div className="w-7 h-7 xs:w-9 xs:h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center text-cyan-200 mb-1 shadow-inner group-hover:rotate-12 transition-transform duration-300">
                    <Sparkles className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-6 sm:h-6 animate-pulse" />
                  </div>
                  <h3 className="text-xs xs:text-sm sm:text-xl font-bold tracking-wide text-white drop-shadow-md">
                    To-Do Citadel
                  </h3>
                  <span className="text-[9px] xs:text-[10px] sm:text-xs font-mono text-cyan-200 font-semibold mt-0.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                    {tasks.filter((t) => !t.completed).length} Missions
                  </span>
                  <span className="text-[8px] xs:text-[9px] sm:text-xs font-mono uppercase tracking-wider text-cyan-300 mt-1 sm:mt-2 px-2 xs:px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-cyan-400/20 border border-cyan-400/40 group-hover:bg-cyan-400/35 transition-all shadow-sm font-semibold">
                    Enter Citadel
                  </span>
                </div>

                {/* Orbiting Tiny Satellite */}
                <div className="absolute -top-1 right-2 xs:-top-2 xs:right-4 w-2.5 h-2.5 xs:w-3.5 xs:h-3.5 rounded-full bg-gradient-to-tr from-cyan-300 to-indigo-400 shadow-[0_0_12px_#38bdf8] animate-bounce" />
              </div>
              <p className="text-[9px] xs:text-[10px] sm:text-sm font-mono text-cyan-300/90 mt-1.5 sm:mt-2 tracking-widest uppercase font-bold drop-shadow">
                Sector 01 • To-Do World
              </p>
            </div>
          </div>

          {/* TOP-RIGHT ROAMING PLANET: Cosmic Vibes Nexus */}
          <div
            onMouseDown={(e) => handlePlanetMouseDown('vibe', e)}
            style={{
              transform: `translate(${planetOffsets.vibe.x}px, ${planetOffsets.vibe.y}px)`,
            }}
            className="absolute top-2 sm:top-6 right-2 sm:right-14 celestial-roam-top-right z-10 select-none cursor-grab active:cursor-grabbing"
          >
            <div className="flex flex-col items-center">
              <div
                id="celestial-vibe-planet"
                onClick={() => {
                  if (!dragStartRef.current.didDrag) setZoomedObject('vibe');
                }}
                className="celestial-planet-sphere w-36 h-36 xs:w-44 xs:h-44 sm:w-56 sm:h-56 md:w-64 md:h-64 relative group transition-transform duration-500 hover:scale-105 active:scale-95"
              >
                <div className="celestial-orbit-circular-ring border-pink-400/35 group-hover:border-pink-400/70" />
                <div className="celestial-sphere-glow bg-pink-600/30 group-hover:bg-pink-500/50" />

                <div className="w-full h-full rounded-full bg-gradient-to-br from-pink-500 via-rose-900 to-space-950 p-2.5 xs:p-3 sm:p-5 shadow-[0_0_75px_rgba(244,114,182,0.5),inset_0_15px_30px_rgba(255,255,255,0.4),inset_0_-18px_45px_rgba(0,0,0,0.9)] border border-pink-300/40 flex flex-col items-center justify-center text-center relative overflow-hidden">
                  <div className="w-7 h-7 xs:w-9 xs:h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center text-pink-200 mb-1 shadow-inner">
                    <Flame className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-6 sm:h-6" />
                  </div>
                  <h4 className="text-xs xs:text-sm sm:text-xl font-bold text-white tracking-wide drop-shadow-md">
                    Vibe Nexus
                  </h4>
                  <span className="text-[9px] xs:text-[10px] sm:text-xs font-mono text-pink-200/90 mt-0.5 font-semibold">
                    Soundscapes & Beats
                  </span>
                  <span className="text-[8px] xs:text-[9px] sm:text-xs font-mono text-pink-200 mt-1 sm:mt-2 px-2 xs:px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-pink-400/25 border border-pink-400/40 font-semibold shadow-sm">
                    Open Nexus
                  </span>
                </div>
              </div>
              <p className="text-[9px] xs:text-[10px] sm:text-sm font-mono text-pink-300/90 mt-1.5 sm:mt-2 tracking-wider uppercase font-bold drop-shadow">
                Sector 02 • Soundscape World
              </p>
            </div>
          </div>

          {/* BOTTOM-LEFT ROAMING PLANET: Orbital Archive Hub (PDFs) */}
          <div
            onMouseDown={(e) => handlePlanetMouseDown('docs', e)}
            style={{
              transform: `translate(${planetOffsets.docs.x}px, ${planetOffsets.docs.y}px)`,
            }}
            className="absolute bottom-3 sm:bottom-10 left-2 sm:left-14 celestial-roam-bottom-left z-10 select-none cursor-grab active:cursor-grabbing"
          >
            <div className="flex flex-col items-center">
              <div
                id="celestial-docs-planet"
                onClick={() => {
                  if (!dragStartRef.current.didDrag) setZoomedObject('docs');
                }}
                className="celestial-planet-sphere w-36 h-36 xs:w-44 xs:h-44 sm:w-56 sm:h-56 md:w-64 md:h-64 relative group transition-transform duration-500 hover:scale-105 active:scale-95"
              >
                <div className="celestial-orbit-circular-ring border-purple-400/35 group-hover:border-purple-400/70" />
                <div className="celestial-sphere-glow bg-purple-600/30 group-hover:bg-purple-500/50" />

                <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-500 via-purple-900 to-space-950 p-2.5 xs:p-3 sm:p-5 shadow-[0_0_75px_rgba(168,85,247,0.5),inset_0_15px_30px_rgba(255,255,255,0.4),inset_0_-18px_45px_rgba(0,0,0,0.9)] border border-purple-300/40 flex flex-col items-center justify-center text-center relative overflow-hidden">
                  <div className="w-7 h-7 xs:w-9 xs:h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center text-purple-200 mb-1 shadow-inner">
                    <BookOpen className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-6 sm:h-6" />
                  </div>
                  <h4 className="text-xs xs:text-sm sm:text-xl font-bold text-white tracking-wide drop-shadow-md">
                    Archive Hub
                  </h4>
                  <span className="text-[9px] xs:text-[10px] sm:text-xs font-mono text-purple-200/90 mt-0.5 font-semibold">
                    PDFs & Document Vault
                  </span>
                  <span className="text-[8px] xs:text-[9px] sm:text-xs font-mono text-purple-200 mt-1 sm:mt-2 px-2 xs:px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-purple-400/25 border border-purple-400/40 font-semibold shadow-sm">
                    Open Archive
                  </span>
                </div>
              </div>
              <p className="text-[9px] xs:text-[10px] sm:text-sm font-mono text-purple-300/90 mt-1.5 sm:mt-2 tracking-wider uppercase font-bold drop-shadow">
                Sector 03 • Archive World
              </p>
            </div>
          </div>

          {/* BOTTOM-RIGHT ROAMING PLANET: Stopwatch Chrono Sphere */}
          <div
            onMouseDown={(e) => handlePlanetMouseDown('stopwatch', e)}
            style={{
              transform: `translate(${planetOffsets.stopwatch.x}px, ${planetOffsets.stopwatch.y}px)`,
            }}
            className="absolute bottom-3 sm:bottom-10 right-2 sm:right-14 celestial-roam-bottom-right z-10 select-none cursor-grab active:cursor-grabbing"
          >
            <div className="flex flex-col items-center">
              <div
                id="celestial-stopwatch-planet"
                onClick={() => {
                  if (!dragStartRef.current.didDrag) setZoomedObject('stopwatch');
                }}
                className="celestial-planet-sphere w-36 h-36 xs:w-44 xs:h-44 sm:w-56 sm:h-56 md:w-64 md:h-64 relative group transition-transform duration-500 hover:scale-105 active:scale-95"
              >
                {/* Orbital Rings */}
                <div className="celestial-orbit-circular-ring border-cyan-400/40 group-hover:border-cyan-400/80" />
                <div className="celestial-orbit-outer-ring border-indigo-400/35 group-hover:border-indigo-400/70" />

                {/* Glowing Plasma Atmosphere */}
                <div className="celestial-sphere-glow bg-cyan-600/40 group-hover:bg-cyan-500/60" />

                {/* 3D Planet Body */}
                <div className="w-full h-full rounded-full bg-gradient-to-br from-cyan-400 via-teal-800 to-space-950 p-2.5 xs:p-3 sm:p-5 shadow-[0_0_85px_rgba(56,189,248,0.55),inset_0_15px_35px_rgba(255,255,255,0.45),inset_0_-18px_45px_rgba(0,0,0,0.9)] border border-cyan-300/40 flex flex-col items-center justify-center text-center relative overflow-hidden">
                  <div className="w-7 h-7 xs:w-9 xs:h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center text-cyan-200 mb-1 shadow-inner group-hover:rotate-45 transition-transform duration-300">
                    <Globe2 className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-6 sm:h-6 text-cyan-300 animate-spin-slow" />
                  </div>
                  <h3 className="text-xs xs:text-sm sm:text-xl font-bold tracking-wide text-white drop-shadow-md">
                    Chrono Sphere
                  </h3>
                  {/* Live Telemetry Display */}
                  <span className="text-[9px] xs:text-[10px] sm:text-xs font-mono text-cyan-200 font-semibold mt-0.5 flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${chronoTelemetry.running ? 'bg-cyan-400 animate-ping' : 'bg-white/40'}`} />
                    {chronoTelemetry.running
                      ? `${Math.floor(chronoTelemetry.timeMs / 60000)}m ${Math.floor((chronoTelemetry.timeMs % 60000) / 1000)}s`
                      : 'Stopwatch & Timer'}
                  </span>
                  <span className="text-[8px] xs:text-[9px] sm:text-xs font-mono uppercase tracking-wider text-cyan-300 mt-1 sm:mt-2 px-2 xs:px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-cyan-400/20 border border-cyan-400/40 group-hover:bg-cyan-400/35 transition-all shadow-sm font-semibold">
                    Enter Chrono
                  </span>
                </div>

                {/* Orbiting Chrono Satellite */}
                <div className="absolute bottom-2 -left-0.5 xs:bottom-3 xs:-left-1 w-2.5 h-2.5 xs:w-3.5 xs:h-3.5 rounded-full bg-gradient-to-tr from-cyan-200 to-teal-400 shadow-[0_0_14px_#38bdf8] animate-pulse" />
              </div>
              <p className="text-[9px] xs:text-[10px] sm:text-sm font-mono text-cyan-300/90 mt-1.5 sm:mt-2 tracking-widest uppercase font-bold drop-shadow">
                Sector 04 • Stopwatch World
              </p>
            </div>
          </div>
        </div>

        {/* FULLSCREEN ZOOM PORTAL: Fits the device window properly */}
        {zoomedObject && (
          <div
            onClick={() => setZoomedObject(null)}
            className="celestial-zoomed-fullscreen"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-[98vw] h-full min-h-[96vh] flex-1 overflow-y-auto custom-scrollbar p-2 sm:p-5 flex flex-col mx-auto"
            >
              {/* Floating Return Button */}
              <div className="flex items-center justify-between pb-3 sm:pb-4 mb-3 sm:mb-4 border-b border-white/10 shrink-0 gap-2">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <span className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full bg-cyan-400 animate-ping shrink-0" />
                  <span className="text-xs sm:text-lg font-mono uppercase tracking-wider text-cyan-300 font-bold truncate">
                    {zoomedObject === 'tasks' && 'Primary Mission Citadel'}
                    {zoomedObject === 'docs' && 'Orbital Archive Hub'}
                    {zoomedObject === 'stopwatch' && 'Orbital Chrono Sphere'}
                    {zoomedObject === 'vibe' && 'Cosmic Sound Nexus'}
                  </span>
                </div>
                <button
                  onClick={() => setZoomedObject(null)}
                  className="px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-xl sm:rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-base font-mono flex items-center gap-1.5 sm:gap-2.5 border border-white/25 transition-all cursor-pointer shadow-lg font-bold active:scale-95 shrink-0"
                  title="Close Zoomed View (Esc)"
                >
                  <Minimize2 className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-300" />
                  <span>Return (Esc)</span>
                </button>
              </div>

              {/* Render Focused Station at true full viewport scale */}
              <div className="relative flex-1 flex flex-col min-h-0 w-full">
                {zoomedObject === 'tasks' && (
                  <div className="glass-panel rounded-3xl p-5 sm:p-8 border border-cyan-400/30 shadow-[0_30px_80px_rgba(0,0,0,0.8)] flex-1 flex flex-col w-full">
                    <div className="flex items-center justify-between pb-5 mb-5 border-b border-white/10 shrink-0">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 border border-white/15 flex items-center justify-center text-cyan-300 shadow-inner">
                          <Sparkles className="w-7 h-7 animate-pulse" />
                        </div>
                        <div>
                          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
                            Primary Mission Citadel
                          </h2>
                          <p className="text-sm sm:text-base text-starlight-200 font-mono mt-1 font-semibold">
                            Orbital Realms, Task Orchestrator & Deep Focus Missions
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Orbital Spheres & Project Realms Embedded Inside To-Do World */}
                    <div className="mb-6 shrink-0">
                      <OrbitSpheres
                        categories={INITIAL_CATEGORIES}
                        activeCategory={activeCategory}
                        onSelectCategory={setActiveCategory}
                        taskCounts={taskCounts}
                      />
                    </div>

                    <div className="shrink-0 mb-4">
                      <CommandBar
                        onAddTask={handleAddTask}
                        categories={INITIAL_CATEGORIES.filter((c) => c.id !== 'all')}
                      />
                    </div>

                    <div className="mb-5 flex items-center justify-between flex-wrap gap-4 px-1 text-sm sm:text-base shrink-0">
                      <div className="flex items-center gap-3">
                        <Filter className="w-5 h-5 text-cyan-300" />
                        <span className="font-mono text-starlight-100 text-sm sm:text-base font-bold">Orbit Filter:</span>
                        <div className="flex bg-space-900/90 p-1.5 rounded-2xl border border-white/15">
                          {(['all', 'pending', 'completed']).map((mode) => (
                            <button
                              key={mode}
                              onClick={() => setFilterMode(mode)}
                              className={`px-4 py-2 rounded-xl capitalize transition-all font-bold text-sm sm:text-base ${
                                filterMode === mode
                                  ? 'bg-cyan-500/30 text-cyan-100 shadow-md border border-cyan-400/50'
                                  : 'text-starlight-300 hover:text-white'
                              }`}
                            >
                              {mode}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-starlight-100 font-mono font-bold text-sm sm:text-base">Gravity Priority:</span>
                        <select
                          value={priorityFilter}
                          onChange={(e) => setPriorityFilter(e.target.value)}
                          className="bg-space-900/90 border border-white/20 text-starlight-100 rounded-2xl px-4 py-2 text-sm sm:text-base focus:outline-none focus:border-cyan-400 font-mono font-semibold"
                        >
                          <option value="all">All Gravities</option>
                          <option value="supernova">Supernova Only (Urgent)</option>
                          <option value="nebula">Nebula Only (Normal)</option>
                          <option value="starlight">Starlight Only (Low)</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-1.5 custom-scrollbar min-h-[400px]">
                      {filteredTasks.length === 0 ? (
                        <div className="glass-card text-center py-20 px-8 rounded-3xl border border-white/10 space-y-4">
                          <Sparkles className="w-12 h-12 mx-auto text-cyan-300 animate-pulse" />
                          <h3 className="font-serif text-3xl text-white font-bold">This Orbit is Weightless and Clear</h3>
                          <p className="text-lg text-starlight-200 max-w-md mx-auto">
                            No active tasks in this quadrant. Launch a new mission with the command bar above.
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 items-start">
                          {filteredTasks.map((task, index) => (
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
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {zoomedObject === 'docs' && (
                  <div className="flex-1 flex flex-col min-h-0 w-full h-full">
                    <PdfDocumentHub />
                  </div>
                )}
                {zoomedObject === 'stopwatch' && (
                  <div className="flex-1 flex flex-col justify-center items-center py-4 w-full h-full">
                    <div className="w-full max-w-5xl">
                      <FocusStopwatch />
                    </div>
                  </div>
                )}
                {zoomedObject === 'vibe' && (
                  <div className="flex-1 flex flex-col min-h-0 w-full h-full">
                    <GeminiVibeGenerator />
                  </div>
                )}
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
