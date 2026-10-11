// Zero-gravity particle disintegration effect
class ParticleDisintegrator {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.animationId = null;
    this.initCanvas();
  }

  initCanvas() {
    if (typeof window === 'undefined') return;
    let canvas = document.getElementById('disintegration-fx-canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'disintegration-fx-canvas';
      canvas.className = 'disintegration-canvas';
      document.body.appendChild(canvas);
    }
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  // Explode an HTML element rect into glowing stardust particles
  explode(domElement, color = '#38bdf8') {
    if (!this.canvas || !domElement) return;
    const rect = domElement.getBoundingClientRect();
    const particleCount = 75;

    // Palette of celestial dust
    const colors = [
      color,
      '#ffffff',
      '#c084fc',
      '#38bdf8',
      '#f472b6',
      '#fef08a'
    ];

    for (let i = 0; i < particleCount; i++) {
      // Stardust origin along the element
      const x = rect.left + Math.random() * rect.width;
      const y = rect.top + Math.random() * rect.height;

      // Anti-gravity upward burst with gentle drift
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4.5 + 1.2;

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 1.5,
        vy: Math.sin(angle) * speed - (Math.random() * 3 + 1.5), // Float upwards
        size: Math.random() * 3.5 + 1,
        life: 1.0,
        decay: Math.random() * 0.018 + 0.012,
        color: colors[Math.floor(Math.random() * colors.length)],
        sparkle: Math.random() > 0.5,
        spin: (Math.random() - 0.5) * 0.2
      });
    }

    if (!this.animationId) {
      this.animate();
    }
  }

  animate() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.96; // air resistance
      p.vy *= 0.96; // float deceleration
      p.life -= p.decay;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, p.life);
      this.ctx.fillStyle = p.color;
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = p.color;

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      this.ctx.fill();

      // Sparkle cross flare
      if (p.sparkle && p.life > 0.4) {
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 0.8;
        this.ctx.beginPath();
        this.ctx.moveTo(p.x - p.size * 2, p.y);
        this.ctx.lineTo(p.x + p.size * 2, p.y);
        this.ctx.moveTo(p.x, p.y - p.size * 2);
        this.ctx.lineTo(p.x, p.y + p.size * 2);
        this.ctx.stroke();
      }

      this.ctx.restore();
    }

    if (this.particles.length > 0) {
      this.animationId = requestAnimationFrame(() => this.animate());
    } else {
      this.animationId = null;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}

export const particleDisintegrator = new ParticleDisintegrator();
