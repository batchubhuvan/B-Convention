import React, { useEffect, useRef } from 'react';

export default function PhysicsParticles() {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle screen resize
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize floating background particles
    const initBackgroundParticles = () => {
      const count = Math.min(60, Math.floor(window.innerWidth / 20));
      for (let i = 0; i < count; i++) {
        particlesRef.current.push(createParticle(
          Math.random() * canvas.width,
          Math.random() * canvas.height,
          true
        ));
      }
    };

    // Helper to generate a single gold particle
    const createParticle = (x, y, isBackground = false) => {
      const goldColors = [
        'rgba(212, 175, 55, ',   // Premium Gold
        'rgba(249, 217, 118, ',  // Light Gold
        'rgba(255, 159, 67, ',   // Orange Gold
        'rgba(255, 255, 255, '   // White sparkle
      ];
      const colorBase = goldColors[Math.floor(Math.random() * goldColors.length)];
      
      const maxLife = isBackground ? 999999 : 100 + Math.random() * 80;

      return {
        x,
        y,
        // Bouncing vectors
        vx: isBackground ? (Math.random() - 0.5) * 0.4 : (Math.random() - 0.5) * 8,
        vy: isBackground ? (Math.random() - 0.5) * 0.4 : -6 - Math.random() * 6,
        radius: isBackground ? 1 + Math.random() * 2 : 2 + Math.random() * 3,
        color: colorBase,
        alpha: isBackground ? 0.05 + Math.random() * 0.15 : 0.8 + Math.random() * 0.2,
        life: maxLife,
        maxLife,
        bounceCount: 0
      };
    };

    initBackgroundParticles();

    // Trigger Confetti Burst global hook
    window.triggerConfetti = () => {
      const burstCount = 80;
      const startX = canvas.width / 2;
      const startY = canvas.height * 0.4; // Burst from center of dashboard
      for (let i = 0; i < burstCount; i++) {
        particlesRef.current.push(createParticle(startX, startY, false));
      }
    };

    // Tracks mouse movements
    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Gravity and Physics Animation Loop
    let animationId;
    const gravity = 0.12; // Earth gravity constant
    const windConstant = 0.05;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const particles = particlesRef.current;
      const mouse = mouseRef.current;

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        
        // Is this a temporary burst particle or static background?
        const isTemporary = p.maxLife < 500000;

        if (isTemporary) {
          // Apply gravity
          p.vy += gravity;
          p.life--;

          // Fading alpha as life decays
          p.alpha = Math.max(0, p.life / p.maxLife);
        } else {
          // Slow floating background particle
          // Gentle drift toward mouse coordinates
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 200) {
            const force = (200 - dist) / 200;
            p.vx += (dx / dist) * force * windConstant;
            p.vy += (dy / dist) * force * windConstant;
            
            // Speed limits
            const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
            if (speed > 1.2) {
              p.vx = (p.vx / speed) * 1.2;
              p.vy = (p.vy / speed) * 1.2;
            }
          }
        }

        // Apply velocities
        p.x += p.vx;
        p.y += p.vy;

        // Bouncing logic off boundaries
        if (p.x < 0) {
          p.x = 0;
          p.vx *= -0.6; // inelastic bounce
        } else if (p.x > canvas.width) {
          p.x = canvas.width;
          p.vx *= -0.6;
        }

        if (p.y > canvas.height) {
          p.y = canvas.height;
          p.vy *= -0.5; // lose half energy on floor bounce
          p.vx *= 0.8;  // friction
          p.bounceCount++;
        }

        // Render Particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color + p.alpha + ')';
        // Add glowing shadow to sparks
        if (!isTemporary) {
          ctx.shadowBlur = 4;
          ctx.shadowColor = 'rgba(212, 175, 55, 0.4)';
        } else {
          ctx.shadowBlur = 8;
          ctx.shadowColor = 'rgba(255, 159, 67, 0.6)';
        }
        ctx.fill();
        ctx.shadowBlur = 0; // reset shadow

        // Expiration check
        if (isTemporary && (p.life <= 0 || p.bounceCount > 4)) {
          particles.splice(i, 1);
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup listeners
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      delete window.triggerConfetti;
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.85
      }}
    />
  );
}
