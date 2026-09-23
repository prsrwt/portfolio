/**
 * The SVG filter behind the .font-hand rule: fine noise pushes each stroke's
 * edge around (feDisplacementMap) so no two letters are cut the same way,
 * then the result is split in two and merged back together:
 *
 *   soak   a wide, faint halo, ink spreading out into the paper fibres
 *   stroke the letter itself, blurred a touch then tightened back up
 *          (feComponentTransfer) so it soaks in rather than going soft
 *
 * Tuned for a hairline script: displacement is kept low so it roughens the
 * edges without breaking a thin stroke in half, and the soak is carried a
 * little heavier, which is what makes fine writing read as wet ink.
 *
 * Rendered once, invisibly; CSS references it as url(#ink-bleed).
 *
 * Only handwriting is filtered. Body text gets its bleed from text-shadow in
 * globals.css instead: an SVG filter over paragraphs whose letters change
 * opacity on every scroll frame would re-rasterise the whole block each time.
 */
export default function InkBleedFilter() {
  return (
    <svg aria-hidden="true" width="0" height="0" className="absolute">
      <filter id="ink-bleed" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="3" seed="4" result="grain" />
        <feDisplacementMap
          in="SourceGraphic"
          in2="grain"
          scale="1.8"
          xChannelSelector="R"
          yChannelSelector="G"
          result="rough"
        />

        <feGaussianBlur in="rough" stdDeviation="1.2" result="spread" />
        <feComponentTransfer in="spread" result="soak">
          <feFuncA type="linear" slope="0.55" />
        </feComponentTransfer>

        <feGaussianBlur in="rough" stdDeviation="0.3" result="soft" />
        <feComponentTransfer in="soft" result="stroke">
          <feFuncA type="linear" slope="2.4" intercept="-0.1" />
        </feComponentTransfer>

        <feMerge>
          <feMergeNode in="soak" />
          <feMergeNode in="stroke" />
        </feMerge>
      </filter>
    </svg>
  );
}
