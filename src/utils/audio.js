// Web Audio API ambient cosmic soundscape synthesizer
class AmbientAudioEngine {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.activeTrack = null; // 'cosmic' | 'rain' | 'drift'
    this.nodes = [];
    this.masterGain = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
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
  playChime(type = 'complete') {
    this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (type === 'complete') {
      // Celestial harmonic chord
      const freqs = [528, 660, 792, 1056];
      freqs.forEach((f, idx) => {
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(f, now + idx * 0.04);
        g.gain.setValueAtTime(0.08, now + idx * 0.04);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 1.2 + idx * 0.1);
        o.connect(g);
        g.connect(this.masterGain);
        o.start(now + idx * 0.04);
        o.stop(now + 1.8);
      });
      return;
    }

    if (type === 'add') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.18);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.35);
    }
  }

  // Generate real-time procedural cosmic noise & drone
  playTrack(trackName) {
    this.init();
    this.stop();

    this.isPlaying = true;
    this.activeTrack = trackName;
    const now = this.ctx.currentTime;

    if (trackName === 'cosmic' || trackName === 'drift') {
      // Deep resonant space drone with stereo detune
      const rootFreq = trackName === 'cosmic' ? 55 : 65.4; // A1 or C2
      const chord = [1, 1.498, 1.999, 2.5, 3]; // Fifths and octaves

      chord.forEach((ratio, i) => {
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = i % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(rootFreq * ratio, now);

        // Slow LFO modulation for cosmic breathing effect
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.frequency.setValueAtTime(0.08 + i * 0.03, now);
        lfoGain.gain.setValueAtTime(4.0, now);
        lfo.connect(osc.detune);
        lfo.start();
        this.nodes.push(lfo);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(320 + i * 80, now);

        gain.gain.setValueAtTime(0.02 / (i + 1), now);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        this.nodes.push(osc, filter, gain);
      });

      // Pinkish noise background for void atmosphere
      this.createNoiseGenerator('pink', 0.015);
    } else if (trackName === 'rain') {
      // Cosmic stardust rain (filtered white noise + subtle droplets)
      this.createNoiseGenerator('rain', 0.035);
    }
  }

  createNoiseGenerator(mode, vol) {
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      if (mode === 'pink' || mode === 'rain') {
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        output[i] *= 0.11;
        b6 = white * 0.115926;
      } else {
        output[i] = white * 0.1;
      }
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = mode === 'rain' ? 'bandpass' : 'lowpass';
    filter.frequency.setValueAtTime(mode === 'rain' ? 850 : 250, this.ctx.currentTime);
    filter.Q.setValueAtTime(1.2, this.ctx.currentTime);

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
