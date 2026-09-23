"use client";

/**
 * Drives the ink blocks rendered by ink.tsx by setting each block's --p
 * (0 → 1, how far the pen has got). Because --p is derived from position,
 * scrolling back up lowers it and the letters un-write in reverse order.
 *
 * Scroll blocks start writing as their top rises past START of the viewport
 * and are fully written once their bottom reaches END.
 *
 * The intro block (hero) is on screen at load, so its pen is the smaller of
 * a short on-load tween and how far you still are from scrolling it away:
 * it writes itself when the page opens, un-writes as you scroll down past
 * INTRO_EXIT of a viewport, and rewrites when you return to the top.
 */

import { useEffect } from "react";

const START = 0.95; // fraction of viewport height from the top
const END = 0.72;
const INTRO_MS = 1500;
const INTRO_EXIT = 0.55; // viewport heights of scroll to fully un-write the intro

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeOut = (t: number) => 1 - (1 - t) ** 3;

export default function InkController() {
  useEffect(() => {
    const blocks = Array.from(document.querySelectorAll<HTMLElement>('[data-ink="scroll"]'));
    const intro = document.querySelector<HTMLElement>('[data-ink="intro"]');
    const last = new WeakMap<HTMLElement, number>();
    const introStart = performance.now();
    let frame = 0;

    const setP = (block: HTMLElement, raw: number) => {
      const p = Math.round(clamp01(raw) * 1000) / 1000;
      if (last.get(block) !== p) {
        last.set(block, p);
        block.style.setProperty("--p", String(p));
        // Marks the block finished so globals.css can switch the ink-bleed
        // filter on; see the note there for why it waits.
        block.toggleAttribute("data-ink-done", p >= 1);
      }
    };

    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      // At the very bottom, the last blocks can't rise to END; finish them.
      const atEnd = window.scrollY + vh >= document.documentElement.scrollHeight - 2;

      for (const block of blocks) {
        const rect = block.getBoundingClientRect();
        const travel = (START - END) * vh + rect.height;
        setP(block, atEnd ? 1 : (START * vh - rect.top) / travel);
      }

      if (intro) {
        const t = clamp01((performance.now() - introStart) / INTRO_MS);
        setP(intro, Math.min(easeOut(t), 1 - window.scrollY / (INTRO_EXIT * vh)));
        // Keep animating until the on-load write has finished.
        if (t < 1) schedule();
      }
    };

    function schedule() {
      if (!frame) frame = requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return null;
}
