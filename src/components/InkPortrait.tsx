"use client";

/**
 * Paras's portrait drawn in ink characters on a canvas, after Gazi Jarin's
 * ASCII portrait: each character flies in from a random spot and settles
 * into place; the mouse pushes nearby characters away and they spring back.
 *
 * Differences from the original:
 *   - The character grid is precomputed (scripts/portrait_ink.py), so the
 *     page never loads or processes the photo itself.
 *   - Sized from its container (ResizeObserver) rather than fixed breakpoints.
 *   - The animation loop stops once everything has settled and restarts on
 *     interaction, instead of running every frame forever.
 *   - Touch never blocks page scrolling: a tap sends a brief ink splash.
 *   - prefers-reduced-motion draws the finished portrait with no motion.
 */

import { useEffect, useRef } from "react";
import data from "@/content/portraitInk.json";

interface Cell {
  /** Target position as a fraction of the canvas size. */
  tx: number;
  ty: number;
  char: string;
  /** Index into the palette: 0 ink, 1 seal red, 2 gold. */
  kind: number;
  alpha: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Seconds before this character starts to appear. */
  delay: number;
  /** Phase offset for the gentle alpha shimmer. */
  shimmer: number;
}

const CELL_STRIDE = 5; // [col, row, charIndex, kind, alpha%] per cell
const CELLS: Cell[] = [];
for (let k = 0; k < data.cells.length; k += CELL_STRIDE) {
  const [col, row, charIndex, kind, alpha] = data.cells.slice(k, k + CELL_STRIDE);
  CELLS.push({
    tx: (col + 0.5) / data.cols,
    ty: (row + 0.5) / data.rows,
    char: data.chars[charIndex],
    kind,
    alpha: alpha / 100,
  });
}

const GOLD = "#b0701a";
/** Multiplies each cell's ink so the small glyphs read clearly on paper. */
const INK_STRENGTH = 1.25;
const SETTLE_AFTER_S = 3;
const TOUCH_SPLASH_MS = 650;

export default function InkPortrait({ label }: { label: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!wrap || !canvas || !ctx) return;

    const css = getComputedStyle(document.documentElement);
    const palette = [
      css.getPropertyValue("--ink").trim() || "#2a1b12",
      css.getPropertyValue("--seal").trim() || "#8b2e1f",
      GOLD,
    ];
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let size = 0;
    let particles: Particle[] = [];
    let start = performance.now();
    let frame = 0;
    const pointer = { x: -1e4, y: -1e4, tx: -1e4, ty: -1e4, active: false, splashUntil: 0 };

    const draw = () => {
      frame = 0;
      const now = performance.now();
      const elapsed = (now - start) / 1000;
      ctx.clearRect(0, 0, size, size);

      if (pointer.splashUntil && now > pointer.splashUntil) {
        pointer.splashUntil = 0;
        pointer.active = false;
        pointer.tx = pointer.ty = -1e4;
      }
      pointer.x += (pointer.tx - pointer.x) * 0.15;
      pointer.y += (pointer.ty - pointer.y) * 0.15;

      const fontSize = Math.max(4, (size / data.cols) * 1.45);
      // Bold: at ~5px, regular-weight glyphs look thin and washed out.
      ctx.font = `700 ${fontSize}px ui-monospace, Consolas, Menlo, monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const reach = size * 0.2;
      let moving = false;

      for (let k = 0; k < particles.length; k++) {
        const p = particles[k];
        const cell = CELLS[k];
        const t = elapsed - p.delay;
        if (t < 0) {
          moving = true;
          continue;
        }

        const targetX = cell.tx * size;
        const targetY = cell.ty * size;
        const lively = pointer.active || t < SETTLE_AFTER_S;

        if (!reduced) {
          if (pointer.active) {
            const dx = p.x - pointer.x;
            const dy = p.y - pointer.y;
            const dist = Math.hypot(dx, dy);
            if (dist > 0 && dist < reach) {
              const force = (1 - dist / reach) * 4;
              p.vx += (dx / dist) * force;
              p.vy += (dy / dist) * force;
            }
          }

          const settle = 1 - (1 - Math.min(t / 2.5, 1)) ** 3;
          const pull = 0.01 + settle * 0.08;
          p.vx += (targetX - p.x) * pull;
          p.vy += (targetY - p.y) * pull;
          if (lively) {
            // A slow "breathing" drift while the portrait is active.
            p.vx += Math.sin(elapsed * 0.5 + targetY * 0.1) * 0.15;
            p.vy += Math.cos(elapsed * 0.5 + targetX * 0.1) * 0.15;
          }
          const damping = lively ? 0.92 : 0.85;
          p.vx *= damping;
          p.vy *= damping;
          p.x += p.vx;
          p.y += p.vy;

          if (lively || Math.abs(targetX - p.x) > 0.05 || Math.abs(targetY - p.y) > 0.05) {
            moving = true;
          } else {
            p.x = targetX;
            p.y = targetY;
            p.vx = p.vy = 0;
          }
        }

        const fade = reduced ? 1 : 1 - (1 - Math.min(t / 1.5, 1)) ** 2;
        const shimmer = lively && !reduced ? Math.sin(elapsed * 2 + p.shimmer) * 0.1 : 0;
        ctx.globalAlpha = Math.max(0, Math.min(1, cell.alpha * INK_STRENGTH * fade + shimmer));
        ctx.fillStyle = palette[cell.kind] ?? palette[0];
        ctx.fillText(cell.char, p.x, p.y);
      }
      ctx.globalAlpha = 1;

      if (moving && !reduced) wake();
    };

    function wake() {
      if (!frame) frame = requestAnimationFrame(draw);
    }

    const resize = () => {
      const next = Math.round(wrap.clientWidth);
      if (!next || next === size) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = next * dpr;
      canvas.height = next * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (particles.length === 0) {
        // First layout: scatter every character around its target.
        particles = CELLS.map((cell) => ({
          x: cell.tx * next + (reduced ? 0 : (Math.random() - 0.5) * next),
          y: cell.ty * next + (reduced ? 0 : (Math.random() - 0.5) * next),
          vx: 0,
          vy: 0,
          delay: reduced ? 0 : Math.random() * 0.4,
          shimmer: Math.random() * Math.PI * 2,
        }));
        start = performance.now();
      } else {
        // Later resizes keep the drawing in place, just rescaled.
        const scale = next / size;
        for (const p of particles) {
          p.x *= scale;
          p.y *= scale;
        }
      }
      size = next;
      wake();
    };

    const toCanvas = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.tx = e.clientX - rect.left;
      pointer.ty = e.clientY - rect.top;
    };
    const onMove = (e: PointerEvent) => {
      if (reduced || e.pointerType !== "mouse") return;
      toCanvas(e);
      if (!pointer.active) {
        // Enter at the cursor, not by sweeping in from off-canvas.
        pointer.x = pointer.tx;
        pointer.y = pointer.ty;
      }
      pointer.active = true;
      wake();
    };
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      pointer.active = false;
      pointer.tx = pointer.ty = -1e4;
      wake();
    };
    const onDown = (e: PointerEvent) => {
      if (reduced || e.pointerType === "mouse") return;
      toCanvas(e);
      pointer.x = pointer.tx;
      pointer.y = pointer.ty;
      pointer.active = true;
      pointer.splashUntil = performance.now() + TOUCH_SPLASH_MS;
      wake();
    };

    const observer = new ResizeObserver(resize);
    observer.observe(wrap);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("pointerdown", onDown);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("pointerdown", onDown);
    };
  }, []);

  return (
    <div ref={wrapRef} className="aspect-square w-full">
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={label}
        className="h-full w-full cursor-crosshair"
      />
    </div>
  );
}
