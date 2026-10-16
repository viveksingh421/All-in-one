# Float — Spatial Study Hub v3.0 🌌

> **A zero-gravity focus workspace and spatial study hub combining orbital mission management, precision chronometers, document archives, and procedural cosmic soundscapes.**

[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Web Audio API](https://img.shields.io/badge/Web_Audio_API-Synthesized-FF6F61)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

---

## 🚀 Overview

**Float** is designed to eliminate cognitive strain through an immersive zero-gravity celestial environment. Instead of mundane lists and static pages, your study and productivity tools exist as **roaming planetary spheres** floating across deep space in a single, responsive viewport.

Every sphere can be dragged interactively with real physics or expanded into a rich, dedicated fullscreen station.

---

## ✨ Features & Planetary Sectors

### 🪐 1. Sector 01 • To-Do Citadel (`Missions World`)
- **Raycast-Style Cosmic Command Bar**: Rapidly manifest tasks with gravitational pull levels (`Starlight`, `Nebula`, `Supernova`), deadlines, and categorised tags.
- **Orbital Sphere Categories**: Filter across *Core Missions*, *Deep Work*, *Reading Orbit*, *Fitness*, and *Creative Horizons*.
- **Particle Stardust Disintegration**: Completing a mission explodes the card into luminous stardust particles (`particleDisintegrator.js`).
- **Drag-and-Drop Prioritization**: Re-order missions seamlessly with zero-gravity inertia.

### 🎧 2. Sector 02 • Vibe Nexus (`Soundscape World`)
- **Procedural Web Audio Engine**: Zero-network, offline-ready ambient audio generator with binaural harmonic drone (110Hz space resonance), gentle rain pings, and cosmic drift white-noise filter sweeps.
- **Gemini AI Music Curator**: Integrated with Google's `gemini-1.5-flash` model (and smart offline procedural fallbacks) to craft customized ambient playlists and study themes with 1-click YouTube playback.
- **Volume & Autoplay Persistence**: Real-time slider with volume level memory and auto-resume toggle across sessions.

### 📚 3. Sector 03 • Orbital Archive Hub (`Document Vault`)
- **PDF & Document Reader**: Drag and drop lab reports, textbook chapters, lecture slides, and research notes.
- **Integrated Browser Viewer**: Preview uploaded PDFs directly within deep space with zoom and fullscreen inspection.
- **Multi-Document Tabs**: Switch seamlessly between active study readings.

### ⏱️ 4. Sector 04 • Chrono Sphere (`Precision Stopwatch & Pomodoro`)
- **Orbital Stopwatch**: High-precision split laps, live millisecond indicators, and 60-second animated circular orbit progress rings.
- **Countdown Chronometer**: Pomodoro presets (`5m`, `15m`, `25m`, `45m`, `60m`) or custom duration input with completion chimes.
- **Live Planetary Telemetry**: The roaming Chrono planet displays active elapsed time on its planetary crust even when closed.

### 🌌 5. Cosmic Environment & Immersion
- **Interactive Roaming Physics**: Planets continuously drift across non-colliding orbital paths and can be grabbed and dragged freely.
- **Dynamic Starfield Canvas**: Responsive star clusters whose warp speed adjusts based on your focus state.
- **Workspace Modes**: Instant toggle between:
  - 📘 **Study Mode**: Soft indigo & emerald calm aura.
  - 💻 **Coding Mode**: High-contrast electric cyan and ultraviolet.
  - 🧘 **Deep Focus**: Ultra-dim cosmic obsidian and violet.
- **Zero-Distraction Focus Chamber**: 1-click modal isolating a single mission with an ultradian flow timer.

---

## 📱 Mobile-First Responsive Design

- **Adaptive Root Font Scaling**: Responsive `rem` scaling ensures balanced margins, readable typography, and zero unwanted horizontal scrolling across all viewports (from `<360px` phones up to `4K` ultra-wide monitors).
- **Mobile-Safe Orbits**: Micro-orbit trajectories adapt automatically to screen dimensions to prevent celestial collisions on narrow viewports.
- **Fluid Stopwatch & Countdown Rings**: SVG rings dynamically resize down to `256px` on smartphones for effortless finger interaction.

---

## 🛠️ Technology Stack

- **Framework**: React 19 + Vite 8
- **Styling**: Tailwind CSS with custom cosmic glassmorphism tokens
- **Audio Synthesis**: Native HTML5 Web Audio API (`AudioContext`, `BiquadFilterNode`, `GainNode`, `OscillatorNode`)
- **Icons**: Lucide React
- **Particle System**: Custom Canvas Particle Emitter & `canvas-confetti`

---

## 📦 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or later recommended)
- `npm` or `pnpm` / `yarn`

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/viveksingh421/All-in-one.git
   cd All-in-one/to_do_list
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

4. **Build for production:**
   ```bash
   npm run build
   ```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Esc` | Return to Deep Space / Close Fullscreen World |
| `Enter` | Launch task from Command Bar |
| `Space` / Click | Drag or interact with roaming planets |

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
