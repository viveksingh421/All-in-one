import React, { useEffect, useRef } from 'react';

export const StarfieldCanvas = ({ speedMultiplier = 1 }) => {
  const canvasRef = useRef(null);
  const speedRef = useRef(speedMultiplier);

  useEffect(() => {
    speedRef.current = speedMultiplier;
  }, [speedMultiplier]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initStars();
    };

    window.addEventListener('resize', handleResize);

    // Particle star definitions & cosmic meteors
    const numStars = 190;
    let stars = [];
    let shootingStars = [];

    const initStars = () => {
      stars = [];
      for (let i = 0; i < numStars; i++) {
        const depth = Math.random(); // 0 to 1 depth layers
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: depth > 0.85 ? Math.random() * 2.2 + 1.2 : Math.random() * 1.5 + 0.4,
          depth: depth * 0.8 + 0.2,
          baseAlpha: Math.random() * 0.65 + 0.25,
          twinkleSpeed: Math.random() * 0.02 + 0.005,
          twinkleOffset: Math.random() * Math.PI * 2,
          vx: (Math.random() - 0.5) * 0.12,
          vy: (Math.random() - 0.5) * 0.12 - 0.04, // slow upward cosmic float
          color:
            Math.random() > 0.65
              ? '#38bdf8' // Cyan nebula star
              : Math.random() > 0.35
              ? '#c084fc' // Deep ultraviolet star
              : Math.random() > 0.15
              ? '#fbcfe8' // Rose starlight
              : '#ffffff', // Pure stellar white
        });
      }
    };

    const spawnShootingStar = () => {
      if (Math.random() < 0.015 && shootingStars.length < 3) {
        shootingStars.push({
          x: Math.random() * width * 0.8,
          y: Math.random() * (height * 0.5),
          len: Math.random() * 80 + 60,
          speed: Math.random() * 10 + 12,
          angle: Math.PI / 4 + (Math.random() - 0.5) * 0.2,
          opacity: 1,
        });
      }
    };

    initStars();

    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetMouseX = mouseX;
    let targetMouseY = mouseY;

    const handleMouseMove = (e) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    let tick = 0;
    const render = () => {
      tick++;
      // Smooth mouse inertia
      mouseX += (targetMouseX - mouseX) * 0.04;
      mouseY += (targetMouseY - mouseY) * 0.04;

      ctx.clearRect(0, 0, width, height);

      // Subtle parallax shifts
      const offsetX = (mouseX - width / 2) * 0.02;
      const offsetY = (mouseY - height / 2) * 0.02;

      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        const currentSpeed = speedRef.current || 1;

        star.x += star.vx * currentSpeed;
        star.y += star.vy * currentSpeed;

        // Wrap around bounds
        if (star.x < 0) star.x = width;
        if (star.x > width) star.x = 0;
        if (star.y < 0) star.y = height;
        if (star.y > height) star.y = 0;

        const alpha =
          star.baseAlpha +
          Math.sin(tick * star.twinkleSpeed + star.twinkleOffset) * 0.25;
        const clampedAlpha = Math.max(0.05, Math.min(1, alpha));

        ctx.fillStyle = star.color;
        ctx.globalAlpha = clampedAlpha;
        ctx.beginPath();
        ctx.arc(
          star.x + offsetX * (star.size * 0.6),
          star.y + offsetY * (star.size * 0.6),
          star.size,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Extra soft cosmic glow for larger stars
        if (star.size > 1.8) {
          ctx.beginPath();
          ctx.fillStyle = star.color;
          ctx.globalAlpha = clampedAlpha * 0.25;
          ctx.arc(
            star.x + offsetX * (star.size * 0.6),
            star.y + offsetY * (star.size * 0.6),
            star.size * 3.2,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
      }

      // Spawn & Draw Shooting Stars (Meteors)
      spawnShootingStar();
      for (let s = shootingStars.length - 1; s >= 0; s--) {
        const meteor = shootingStars[s];
        meteor.x += Math.cos(meteor.angle) * meteor.speed;
        meteor.y += Math.sin(meteor.angle) * meteor.speed;
        meteor.opacity -= 0.015;

        if (meteor.opacity <= 0 || meteor.x > width || meteor.y > height) {
          shootingStars.splice(s, 1);
          continue;
        }

        const tailX = meteor.x - Math.cos(meteor.angle) * meteor.len;
        const tailY = meteor.y - Math.sin(meteor.angle) * meteor.len;

        const grad = ctx.createLinearGradient(tailX, tailY, meteor.x, meteor.y);
        grad.addColorStop(0, 'transparent');
        grad.addColorStop(1, `rgba(165, 243, 252, ${meteor.opacity})`);

        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(meteor.x, meteor.y);
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <>
      {/* Background Interactive Stardust Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0"
      />

      {/* Floating Ambient Glowing Cosmic Orbs in background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-[110px] animate-pulse-glow" />
        <div
          className="absolute top-1/3 -right-24 w-[30rem] h-[30rem] bg-purple-600/10 rounded-full blur-[130px] animate-pulse-glow"
          style={{ animationDelay: '2s' }}
        />
        <div
          className="absolute -bottom-36 left-1/4 w-[32rem] h-[32rem] bg-pink-500/10 rounded-full blur-[140px] animate-pulse-glow"
          style={{ animationDelay: '4s' }}
        />
      </div>
    </>
  );
};
