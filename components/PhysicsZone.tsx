'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Atom, BrainCircuit, Code2, Database, ShieldCheck, Wind, Server, Container, Cloud, GitBranch, Figma, Terminal, Cpu } from 'lucide-react';

interface PhysicsBody {
  el: HTMLDivElement;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  isDragging: boolean;
}

const PhysicsZone = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const requestRef = useRef<number>(0);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const bodiesRef = useRef<PhysicsBody[]>([]);
  const [shouldAnimate, setShouldAnimate] = useState(true);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setShouldAnimate(false);
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    // Physics Configuration
    const physics = {
      friction: 0.995,
      restitution: 0.9,
      mouseForce: 1.5,
      mouseRadius: 200,
      maxSpeed: 3
    };

    // Initialize bodies
    const bodies = itemsRef.current.filter(Boolean).map((el) => {
      if (!el) return null;
      
      // Random start position
      const x = Math.random() * (window.innerWidth - 100);
      const y = Math.random() * (window.innerHeight - 100);
      
      // Random velocity
      const vx = (Math.random() - 0.5) * 4;
      const vy = (Math.random() - 0.5) * 4;

      return {
        el,
        x,
        y,
        vx,
        vy,
        width: el.offsetWidth,
        height: el.offsetHeight,
        isDragging: false
      };
    }).filter((item): item is PhysicsBody => item !== null);

    bodiesRef.current = bodies;

    // Mouse Move Listener
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    // Resize Listener
    const handleResize = () => {
      bodiesRef.current.forEach(body => {
        body.width = body.el.offsetWidth;
        body.height = body.el.offsetHeight;
        if (body.x > window.innerWidth) body.x = window.innerWidth - body.width;
        if (body.y > window.innerHeight) body.y = window.innerHeight - body.height;
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    // Dragging Logic
    let draggedBody: PhysicsBody | null = null;

    const handleMouseDown = (e: MouseEvent, body: PhysicsBody) => {
      draggedBody = body;
      body.isDragging = true;
      e.preventDefault();
    };

    const handleMouseUp = () => {
      if (draggedBody) {
        draggedBody.isDragging = false;
        draggedBody = null;
      }
    };

    bodies.forEach(body => {
      body.el.addEventListener('mousedown', (e: MouseEvent) => handleMouseDown(e, body));
    });

    window.addEventListener('mouseup', handleMouseUp);

    // Animation Loop
    const animate = () => {
      if (!shouldAnimate) return;

      const width = window.innerWidth;
      const height = window.innerHeight;
      const { x: mouseX, y: mouseY } = mouseRef.current;

      bodiesRef.current.forEach(body => {
        if (body.isDragging) {
          const dx = mouseX - (body.x + body.width / 2);
          const dy = mouseY - (body.y + body.height / 2);
          body.vx = dx * 0.1;
          body.vy = dy * 0.1;
        } else {
          // Mouse Repulsion
          const cx = body.x + body.width / 2;
          const cy = body.y + body.height / 2;
          const dx = cx - mouseX;
          const dy = cy - mouseY;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < physics.mouseRadius) {
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            const force = (physics.mouseRadius - distance) / physics.mouseRadius;
            
            body.vx += forceDirectionX * force * physics.mouseForce;
            body.vy += forceDirectionY * force * physics.mouseForce;
          }

          // Space drift (random slight nudges)
          body.vx += (Math.random() - 0.5) * 0.02;
          body.vy += (Math.random() - 0.5) * 0.02;
        }

        // Friction
        body.vx *= physics.friction;
        body.vy *= physics.friction;

        // Speed Limit
        const speed = Math.sqrt(body.vx ** 2 + body.vy ** 2);
        if (speed > physics.maxSpeed) {
          body.vx = (body.vx / speed) * physics.maxSpeed;
          body.vy = (body.vy / speed) * physics.maxSpeed;
        }

        // Update Position
        body.x += body.vx;
        body.y += body.vy;

        // Boundary Collisions
        if (body.x + body.width > width) {
          body.x = width - body.width;
          body.vx *= -physics.restitution;
        }
        if (body.x < 0) {
          body.x = 0;
          body.vx *= -physics.restitution;
        }
        if (body.y + body.height > height) {
          body.y = height - body.height;
          body.vy *= -physics.restitution;
        }
        if (body.y < 0) {
          body.y = 0;
          body.vy *= -physics.restitution;
        }

        // Apply Transform
        body.el.style.transform = `translate(${body.x}px, ${body.y}px)`;
      });

      requestRef.current = requestAnimationFrame(animate);
    };

    // Visibility Change Handler
    const handleVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(requestRef.current);
      } else {
        requestRef.current = requestAnimationFrame(animate);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    requestRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(requestRef.current);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [shouldAnimate]);

  if (!shouldAnimate) return null;

  return (
    <div ref={containerRef} id="gravity-zone" className="fixed inset-0 w-full h-full overflow-hidden pointer-events-auto z-0">
      {/* Item 1: React */}
      <div ref={el => { itemsRef.current[0] = el }} className="physics-item">
        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-slate-200 text-slate-600 animate-float" style={{ animationDelay: '0s' }}>
          <Atom className="w-5 h-5 text-blue-500" />
          <span className="text-sm font-medium">React</span>
        </div>
      </div>

      {/* Item 2: TypeScript */}
      <div ref={el => { itemsRef.current[1] = el }} className="physics-item">
        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-slate-200 text-slate-600 animate-float" style={{ animationDelay: '1s' }}>
          <span className="font-bold text-blue-600 text-sm">TS</span>
          <span className="text-sm font-medium">TypeScript</span>
        </div>
      </div>

      {/* Item 3: AI Badge */}
      <div ref={el => { itemsRef.current[2] = el }} className="physics-item">
        <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg text-white animate-float" style={{ animationDelay: '2s' }}>
          <BrainCircuit className="w-8 h-8" />
        </div>
      </div>

      {/* Item 4: Python */}
      <div ref={el => { itemsRef.current[3] = el }} className="physics-item">
        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-slate-200 text-slate-600 animate-float" style={{ animationDelay: '0.5s' }}>
          <Code2 className="w-5 h-5 text-yellow-500" />
          <span className="text-sm font-medium">Python</span>
        </div>
      </div>

      {/* Item 5: Tailwind */}
      <div ref={el => { itemsRef.current[4] = el }} className="physics-item">
        <div className="flex items-center justify-center w-12 h-12 bg-sky-100 rounded-full border border-sky-200 text-sky-500 animate-float" style={{ animationDelay: '1.5s' }}>
          <Wind className="w-6 h-6" />
        </div>
      </div>

      {/* Item 6: Database */}
      <div ref={el => { itemsRef.current[5] = el }} className="physics-item">
        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-slate-200 text-slate-600 animate-float" style={{ animationDelay: '2.5s' }}>
          <Database className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold">Postgres</span>
        </div>
      </div>

      {/* Item 7: Lock/Security */}
      <div ref={el => { itemsRef.current[6] = el }} className="physics-item">
        <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-100 text-emerald-600 animate-float" style={{ animationDelay: '3s' }}>
          <ShieldCheck className="w-6 h-6" />
        </div>
      </div>

      {/* Item 8: Node */}
      <div ref={el => { itemsRef.current[7] = el }} className="physics-item">
        <div className="px-3 py-1 bg-green-50 rounded border border-green-200 text-green-700 text-xs font-bold tracking-widest animate-float" style={{ animationDelay: '0.8s' }}>
          NODE
        </div>
      </div>

      {/* Item 9: Next.js */}
      <div ref={el => { itemsRef.current[8] = el }} className="physics-item">
        <div className="flex items-center justify-center w-10 h-10 bg-black rounded-full text-white animate-float" style={{ animationDelay: '1.8s' }}>
          <span className="font-bold text-xs">N</span>
        </div>
      </div>

      {/* Item 10: Server */}
      <div ref={el => { itemsRef.current[9] = el }} className="physics-item">
        <div className="p-2 bg-white rounded shadow-sm border border-slate-200 animate-float" style={{ animationDelay: '2.2s' }}>
          <Server className="w-5 h-5 text-slate-500" />
        </div>
      </div>
      
      {/* Item 11: Image Placeholder (Profile style) */}
      <div ref={el => { itemsRef.current[10] = el }} className="physics-item">
        <div className="w-14 h-14 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-md animate-float" style={{ animationDelay: '1.2s' }}>
          <Image 
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Leo" 
            alt="Leo" 
            width={56} 
            height={56} 
            className="w-full h-full object-cover"
            unoptimized // Dicebear is an external URL
          />
        </div>
      </div>

      {/* Item 12: Docker */}
      <div ref={el => { itemsRef.current[11] = el }} className="physics-item">
        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-slate-200 text-slate-600 animate-float" style={{ animationDelay: '0.3s' }}>
          <Container className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-medium">Docker</span>
        </div>
      </div>

      {/* Item 13: Cloud */}
      <div ref={el => { itemsRef.current[12] = el }} className="physics-item">
        <div className="p-3 bg-orange-50 rounded-xl border border-orange-100 text-orange-500 animate-float" style={{ animationDelay: '1.7s' }}>
          <Cloud className="w-7 h-7" />
        </div>
      </div>

      {/* Item 14: Git */}
      <div ref={el => { itemsRef.current[13] = el }} className="physics-item">
        <div className="flex items-center justify-center w-10 h-10 bg-red-50 rounded-lg border border-red-100 text-red-500 animate-float" style={{ animationDelay: '2.1s' }}>
          <GitBranch className="w-5 h-5" />
        </div>
      </div>

      {/* Item 15: Figma */}
      <div ref={el => { itemsRef.current[14] = el }} className="physics-item">
        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-slate-200 text-slate-600 animate-float" style={{ animationDelay: '0.9s' }}>
          <Figma className="w-4 h-4 text-purple-500" />
          <span className="text-xs font-semibold">Design</span>
        </div>
      </div>

      {/* Item 16: Terminal */}
      <div ref={el => { itemsRef.current[15] = el }} className="physics-item">
        <div className="p-2 bg-slate-800 rounded-md text-green-400 animate-float" style={{ animationDelay: '2.8s' }}>
          <Terminal className="w-5 h-5" />
        </div>
      </div>

      {/* Item 17: Hardware */}
      <div ref={el => { itemsRef.current[16] = el }} className="physics-item">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full border border-gray-200 text-gray-600 animate-float" style={{ animationDelay: '1.4s' }}>
          <Cpu className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

export default PhysicsZone;

