import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";
import { profile } from "@/content/diary";

/**
 * The card that appears when the site is shared. Generated rather than drawn
 * so it always matches the copy in diary.ts.
 *
 * The two fonts are committed next to this file and read from disk. This
 * route is prerendered, so the read happens once at build time and the
 * result ships as a static PNG; Turbopack does not yet support the
 * `fetch(new URL(..., import.meta.url))` form the Next docs show.
 * Satori lays out with flexbox only, so every container states its display.
 */

export const alt = `${profile.name}, ${profile.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PAGE = "#faebd7";
const INK = "#2a1b12";
const INK_SOFT = "#5e4632";
const SEAL = "#8b2e1f";

export default async function Image() {
  const fonts = join(process.cwd(), "src", "app");
  const [hand, serif] = await Promise.all([
    readFile(join(fonts, "Caveat-Regular.ttf")),
    readFile(join(fonts, "CormorantGaramond-Regular.ttf")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "90px 100px",
          backgroundColor: PAGE,
          // The same aged-paper vignette the site uses.
          backgroundImage:
            "radial-gradient(ellipse at center, rgba(250,235,215,0) 55%, rgba(120,82,40,0.18) 100%)",
        }}
      >
        <div style={{ display: "flex", fontFamily: "hand", fontSize: 132, color: INK, lineHeight: 1 }}>
          {profile.name}
        </div>

        <div style={{ display: "flex", width: 180, height: 4, backgroundColor: SEAL, margin: "38px 0" }} />

        <div style={{ display: "flex", fontFamily: "serif", fontSize: 46, color: INK }}>
          {profile.role} in Dehradun, India
        </div>
        <div
          style={{
            display: "flex",
            fontFamily: "serif",
            fontSize: 36,
            color: INK_SOFT,
            marginTop: 18,
          }}
        >
          Currently building SwiftCause, a donation platform for UK charities.
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "hand", data: hand, style: "normal", weight: 400 },
        { name: "serif", data: serif, style: "normal", weight: 400 },
      ],
    },
  );
}
