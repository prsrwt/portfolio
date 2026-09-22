/**
 * Ink: splits diary text into per-letter spans so each letter can write
 * itself in order (see the .ch rules in globals.css). This file only renders
 * markup, with no client JS; InkController drives the blocks.
 *
 * A block is one element marked with blockProps(); every letter inside it
 * gets --i, its position in that block's writing order, and the block
 * carries --n, its letter count. InkController sets the block's --p (0 → 1,
 * how far the pen has got) from scroll position, so scrolling down writes
 * and scrolling up un-writes. An `intro` block (the hero) instead writes
 * itself on load and un-writes as you scroll away from the top.
 */

import type { CSSProperties, ReactNode } from "react";

type InkStyle = CSSProperties & Record<`--${string}`, string | number>;

export interface InkWriter {
  /** Renders `text` as ink letters, continuing this block's writing order. */
  text: (text: string) => ReactNode;
  /** Style for a non-text element (icon, button) to appear after the text so far. */
  after: () => InkStyle;
  /** Props for the block element; call after all text() calls. */
  blockProps: (options?: { intro?: boolean }) => {
    "data-ink": "intro" | "scroll";
    style: InkStyle;
  };
}

export function inkWriter(): InkWriter {
  let count = 0;

  return {
    text(text) {
      const start = count;
      count += text.length;
      return (
        <>
          {/* Screen readers get the plain sentence, not letter-by-letter spans. */}
          <span className="sr-only">{text}</span>
          <span aria-hidden="true">
            {Array.from(text, (ch, k) =>
              ch === " " ? (
                " "
              ) : (
                <span key={k} className="ch" style={{ "--i": start + k } as InkStyle}>
                  {ch}
                </span>
              ),
            )}
          </span>
        </>
      );
    },

    after() {
      return { "--i": count };
    },

    blockProps(options) {
      // +1 so an after() element (at --i = count) is still reached.
      return { "data-ink": options?.intro ? "intro" : "scroll", style: { "--n": count + 1 } };
    },
  };
}
