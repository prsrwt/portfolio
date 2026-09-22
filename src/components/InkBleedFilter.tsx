/**
 * The SVG filter behind the .ink-bleed class: fine noise nudges each stroke's
 * edge by about a pixel (feDisplacementMap), then a slight blur is tightened
 * back up (feComponentTransfer) so edges look soaked-in rather than soft.
 * Rendered once, invisibly; CSS references it as url(#ink-bleed).
 */
export default function InkBleedFilter() {
  return (
    <svg aria-hidden="true" width="0" height="0" className="absolute">
      <filter id="ink-bleed" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" result="grain" />
        <feDisplacementMap in="SourceGraphic" in2="grain" scale="2.2" xChannelSelector="R" yChannelSelector="G" result="rough" />
        <feGaussianBlur in="rough" stdDeviation="0.35" result="soft" />
        <feComponentTransfer in="soft">
          <feFuncA type="linear" slope="1.6" intercept="-0.05" />
        </feComponentTransfer>
      </filter>
    </svg>
  );
}
