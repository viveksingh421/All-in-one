// Web Audio API ambient cosmic soundscape synthesizer
class AmbientAudioEngine {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.activeTrack = null; // 'cosmic' | 'rain' | 'drift'
    this.nodes = [];
    this.masterGain = null;
    this.volume = (() => {
      try {
        const saved = localStorage.getItem('aether_sound_volume');
        return saved !== null ? parseFloat(saved) : 0.45;
      } catch {
        return 0.45;
      }
    })();
  }

  async init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  setVolume(newVol) {
    const clamped = Math.max(0, Math.min(1, newVol));
    this.volume = clamped;
    try {
      localStorage.setItem('aether_sound_volume', clamped.toString());
    } catch {
      // ignore
    }
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(clamped, this.ctx.currentTime);
    }
  }

  stop() {
    this.nodes.forEach(n => {
      try {
        if (n.stop) n.stop();
        if (n.disconnect) n.disconnect();
      } catch (e) {
        // silence any teardown error
      }
    });
    this.nodes = [];
    this.isPlaying = false;
    this.activeTrack = null;
  }

  // Play pleasant chime on complete / interact
  async playChime(type = 'complete') {
    await this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (type === 'complete') {
      // Celestial harmonic chord (C major / pentatonic resonance)
      const freqs = [523.25, 659.25, 783.99, 1046.50];
      freqs.forEach((f, idx) => {
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(f, now + idx * 0.05);
        g.gain.setValueAtTime(0.12, now + idx * 0.05);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 1.4 + idx * 0.1);
        o.connect(g);
        g.connect(this.masterGain);
        o.start(now + idx * 0.05);
        o.stop(now + 2.0);
      });
      return;
    }

    if (type === 'add') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.18);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.35);
    }
  }

  // Generate real-time procedural cosmic noise & drone
  async playTrack(trackName) {
    await this.init();
    this.stop();

    this.isPlaying = true;
    this.activeTrack = trackName;
    const now = this.ctx.currentTime;

    if (trackName === 'cosmic' || trackName === 'drift') {
      // Warm space chord drones with gentle binaural detune
      const rootFreq = trackName === 'cosmic' ? 110 : 130.81; // A2 or C3 for audible warmth
      const chord = [1, 1.25, 1.5, 2.0]; // Root, Major 3rd, 5th, Octave

      chord.forEach((ratio, i) => {
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = i === 0 ? 'sawtooth' : 'sine';
        osc.frequency.setValueAtTime(rootFreq * ratio, now);

        // LFO subtle undulating chorus
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.frequency.setValueAtTime(0.1 + i * 0.05, now);
        lfoGain.gain.setValueAtTime(6.0, now);
        lfo.connect(osc.detune);
        lfo.start(now);
        this.nodes.push(lfo);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(380 + i * 120, now);
        filter.Q.setValueAtTime(2.0, now);

        gain.gain.setValueAtTime(0.07 / (i + 1), now);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        this.nodes.push(osc, filter, gain);
      });

      // Warm pink noise bed
      this.createNoiseGenerator('pink', 0.04);
    } else if (trackName === 'rain') {
      // Soothing cosmic stardust rain
      this.createNoiseGenerator('rain', 0.08);

      // Add gentle random stardust pings
      const pingInterval = setInterval(() => {
        if (!this.isPlaying || this.activeTrack !== 'rain' || !this.ctx) {
          clearInterval(pingInterval);
          return;
        }
        const pingOsc = this.ctx.createOscillator();
        const pingGain = this.ctx.createGain();
        const t = this.ctx.currentTime;
        pingOsc.type = 'sine';
        pingOsc.frequency.setValueAtTime(800 + Math.random() * 1200, t);
        pingGain.gain.setValueAtTime(0.03, t);
        pingGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
        pingOsc.connect(pingGain);
        pingGain.connect(this.masterGain);
        pingOsc.start(t);
        pingOsc.stop(t + 0.45);
      }, 450);
      this.nodes.push({ stop: () => clearInterval(pingInterval) });
    }
  }

  createNoiseGenerator(mode, vol) {
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.16;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = mode === 'rain' ? 'bandpass' : 'lowpass';
    filter.frequency.setValueAtTime(mode === 'rain' ? 1200 : 350, this.ctx.currentTime);
    filter.Q.setValueAtTime(mode === 'rain' ? 0.8 : 1.5, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    whiteNoise.start();
    this.nodes.push(whiteNoise, filter, gain);
  }
}

export const soundManager = new AmbientAudioEngine();
