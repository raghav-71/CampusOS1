'use client';

import React, { useEffect, useRef } from 'react';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  pulseOffset: number;
}

interface Packet {
  nodeFrom: number;
  nodeTo: number;
  progress: number;
  speed: number;
}

export default function CampusNetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Check touch/mobile device
    const isTouchDevice = window.matchMedia('(hover: none)').matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let animationFrameId: number;

    let mouseX = -1000;
    let mouseY = -1000;
    let targetMouseX = -1000;
    let targetMouseY = -1000;

    const handleMouseMove = (e: MouseEvent) => {
      if (isTouchDevice) return;
      const rect = canvas.getBoundingClientRect();
      targetMouseX = e.clientX - rect.left;
      targetMouseY = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      targetMouseX = -1000;
      targetMouseY = -1000;
    };

    if (!isTouchDevice) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
      document.addEventListener('mouseleave', handleMouseLeave, { passive: true });
    }

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.parentElement?.clientHeight || window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    // Desktop: 9-11 nodes; Mobile: 5-6 nodes
    const isMobile = width < 768;
    const nodeCount = isMobile ? 6 : 10;
    const maxLineDist = isMobile ? 150 : 210;

    const nodes: Node[] = [];
    for (let i = 0; i < nodeCount; i++) {
      // Distribute nodes roughly around the perimeter / margins so they frame the center card
      const angle = (i / nodeCount) * Math.PI * 2 + (Math.random() * 0.4 - 0.2);
      const distFromCenter = isMobile
        ? Math.min(width, height) * (0.35 + Math.random() * 0.15)
        : Math.min(width, height) * (0.32 + Math.random() * 0.22);
      
      const cx = width / 2 + Math.cos(angle) * distFromCenter;
      const cy = height / 2 + Math.sin(angle) * distFromCenter;

      nodes.push({
        x: Math.max(30, Math.min(width - 30, cx)),
        y: Math.max(30, Math.min(height - 30, cy)),
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        radius: 2.5 + Math.random() * 1.5,
        pulseOffset: Math.random() * Math.PI * 2,
      });
    }

    // A few subtle data packets flowing along connected nodes
    const packets: Packet[] = [];
    for (let p = 0; p < (isMobile ? 2 : 3); p++) {
      packets.push({
        nodeFrom: p % nodeCount,
        nodeTo: (p + 1) % nodeCount,
        progress: Math.random(),
        speed: 0.002 + Math.random() * 0.002,
      });
    }

    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse interpolation
      if (!isTouchDevice && targetMouseX !== -1000) {
        if (mouseX === -1000) {
          mouseX = targetMouseX;
          mouseY = targetMouseY;
        } else {
          mouseX += (targetMouseX - mouseX) * 0.08;
          mouseY += (targetMouseY - mouseY) * 0.08;
        }
      }

      // Update & Draw Nodes
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        if (!prefersReducedMotion) {
          node.x += node.vx;
          node.y += node.vy;

          // Boundary bounce with soft padding
          const pad = 35;
          if (node.x < pad) { node.x = pad; node.vx *= -1; }
          if (node.x > width - pad) { node.x = width - pad; node.vx *= -1; }
          if (node.y < pad) { node.y = pad; node.vy *= -1; }
          if (node.y > height - pad) { node.y = height - pad; node.vy *= -1; }

          // Very subtle mouse reaction (max 8px shift)
          if (!isTouchDevice && mouseX !== -1000) {
            const dx = node.x - mouseX;
            const dy = node.y - mouseY;
            const dist = Math.hypot(dx, dy);
            if (dist < 180 && dist > 1) {
              const force = (1 - dist / 180) * 0.4;
              node.x += (dx / dist) * force;
              node.y += (dy / dist) * force;
            }
          }
        }

        // Draw connections to nearby nodes
        for (let j = i + 1; j < nodes.length; j++) {
          const other = nodes[j];
          const dx = other.x - node.x;
          const dy = other.y - node.y;
          const dist = Math.hypot(dx, dy);

          if (dist < maxLineDist) {
            const alpha = Math.max(0, (1 - dist / maxLineDist) * 0.16);
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = `rgba(34, 197, 94, ${alpha.toFixed(3)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }

        // Draw subtle node gentle pulse ring
        const pulse = (Math.sin(time * 0.03 + node.pulseOffset) + 1) / 2;
        const ringRadius = node.radius + pulse * 5;
        const ringAlpha = (1 - pulse) * 0.22;

        ctx.beginPath();
        ctx.arc(node.x, node.y, ringRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(34, 197, 94, ${ringAlpha.toFixed(3)})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // Draw node core
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#22C55E';
        ctx.fill();

        // Very small soft highlight in center
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fill();
      }

      // Draw subtle data packets along valid connections
      if (!prefersReducedMotion) {
        for (let p = 0; p < packets.length; p++) {
          const pkt = packets[p];
          const from = nodes[pkt.nodeFrom];
          const to = nodes[pkt.nodeTo];
          if (!from || !to) continue;

          const dist = Math.hypot(to.x - from.x, to.y - from.y);
          if (dist < maxLineDist) {
            pkt.progress += pkt.speed;
            if (pkt.progress >= 1) {
              pkt.progress = 0;
              pkt.nodeFrom = pkt.nodeTo;
              pkt.nodeTo = (pkt.nodeTo + 1 + Math.floor(Math.random() * (nodes.length - 2))) % nodes.length;
            }

            const px = from.x + (to.x - from.x) * pkt.progress;
            const py = from.y + (to.y - from.y) * pkt.progress;

            // Packet dot
            ctx.beginPath();
            ctx.arc(px, py, 1.8, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(34, 197, 94, 0.7)';
            ctx.fill();
          } else {
            // Re-route to an adjacent node within range
            pkt.nodeTo = (pkt.nodeTo + 1) % nodes.length;
            pkt.progress = 0;
          }
        }
      }

      time += 1;

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      if (!isTouchDevice) {
        window.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  return (
    <div
      className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0"
      aria-hidden="true"
    >
      {/* ─── 1. BASE BACKGROUND & SUBTLE ACADEMIC GRID ──────────────────── */}
      <div className="absolute inset-0 bg-[#F8FAFC]" />
      <div
        className="absolute inset-0 opacity-[0.45]"
        style={{
          backgroundImage:
            'radial-gradient(#CBD5E1 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* ─── 2. SOFT LARGE GREEN GRADIENT BLOBS (SLOW 14-22s BREATHING) ─── */}
      {/* Top Right Blob */}
      <div
        className="absolute -top-28 -right-28 w-[560px] h-[560px] rounded-full opacity-65 filter blur-[105px] transition-transform"
        style={{
          background:
            'radial-gradient(circle, rgba(220, 252, 231, 0.95) 0%, rgba(240, 253, 244, 0.5) 50%, transparent 70%)',
          animation: 'blobFloatSlow 18s ease-in-out infinite alternate',
        }}
      />

      {/* Bottom Left Blob */}
      <div
        className="absolute -bottom-36 -left-36 w-[620px] h-[620px] rounded-full opacity-60 filter blur-[120px] transition-transform"
        style={{
          background:
            'radial-gradient(circle, rgba(220, 252, 231, 0.9) 0%, rgba(240, 253, 244, 0.55) 45%, transparent 70%)',
          animation: 'blobFloatSlow 22s ease-in-out infinite alternate-reverse',
        }}
      />

      {/* Center Subtle Atmosphere Behind Hero Card */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[460px] rounded-full opacity-40 filter blur-[110px]"
        style={{
          background:
            'radial-gradient(ellipse, rgba(240, 253, 244, 0.98) 0%, rgba(220, 252, 231, 0.4) 40%, transparent 75%)',
        }}
      />

      {/* ─── 3. MINIMALIST ABSTRACT CAMPUS CONNECTIVITY VECTOR (SUBTLE) ─── */}
      <svg
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[940px] max-w-full h-auto opacity-[0.045] select-none"
        viewBox="0 0 800 500"
        fill="none"
        stroke="#15803D"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Subtle architectural colonnade & academic dome outlines */}
        <path d="M400 120 L400 80 L390 80 L400 60 L410 80 L400 80" />
        <path d="M340 140 C340 100 460 100 460 140 Z" />
        <path d="M300 160 L500 160 L500 170 L300 170 Z" />
        <line x1="320" y1="170" x2="320" y2="280" />
        <line x1="360" y1="170" x2="360" y2="280" />
        <line x1="400" y1="170" x2="400" y2="280" />
        <line x1="440" y1="170" x2="440" y2="280" />
        <line x1="480" y1="170" x2="480" y2="280" />
        <path d="M280 280 L520 280 L530 290 L270 290 Z" />
        {/* Faint academic orbit / digital learning rings */}
        <circle cx="400" cy="220" r="160" strokeDasharray="3 6" />
        <circle cx="400" cy="220" r="230" strokeDasharray="2 8" />
        {/* Subtle geometric learning nodes */}
        <circle cx="240" cy="180" r="4" fill="#15803D" fillOpacity="0.4" />
        <circle cx="560" cy="180" r="4" fill="#15803D" fillOpacity="0.4" />
        <circle cx="400" cy="380" r="4" fill="#15803D" fillOpacity="0.4" />
        <line x1="240" y1="180" x2="320" y2="170" strokeDasharray="4 4" />
        <line x1="560" y1="180" x2="480" y2="170" strokeDasharray="4 4" />
        <line x1="400" y1="380" x2="400" y2="290" strokeDasharray="4 4" />
      </svg>

      {/* ─── 4. INTELLIGENT CAMPUS NETWORK CANVAS ───────────────────────── */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block"
      />

      {/* Global slow blob animation keyframes */}
      <style jsx>{`
        @keyframes blobFloatSlow {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          50% {
            transform: translate(25px, 20px) scale(1.05);
          }
          100% {
            transform: translate(-15px, 10px) scale(0.98);
          }
        }
      `}</style>
    </div>
  );
}
