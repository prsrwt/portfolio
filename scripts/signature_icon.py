"""Writes src/app/icon.svg: Paras's name in his own hand, inked on paper.

The favicon has to survive being drawn at 16px, so the name is set on two
lines by default. On one line it is roughly four times wider than it is tall,
which in a square icon leaves the letters about three pixels high and turns
the whole thing into a smudge.

Glyphs are baked into SVG paths rather than set as <text>, because an SVG
favicon is rendered without fetching anything, so a webfont would silently
fall back to whatever the system has. HarfBuzz does the shaping so the script
face keeps its kerning.

    python scripts/signature_icon.py                  # two lines (default)
    python scripts/signature_icon.py --layout oneline
    python scripts/signature_icon.py --layout initials

The font is read from Next's font cache, so run `npm run build` first if
.next/static/media is empty. Next splits each family into unicode-range
subsets and only one of them carries Latin, so the file is chosen by which
one actually has the letters, not by name alone.

    pip install fonttools brotli uharfbuzz

The generated icon.svg is committed, so the site itself needs none of this.
"""

import argparse
import glob
import io
import pathlib

import uharfbuzz as hb
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.misc.transform import Transform

PAGE = "#faebd7"
INK = "#2a1b12"
BOX = 64          # viewBox size; the icon itself is square
PAD = 6           # breathing room so strokes never touch the rounded corner
LINE_GAP = 0.82   # line spacing as a fraction of the em

LAYOUTS = {"stacked": ["Paras", "Rawat"], "oneline": ["Paras Rawat"], "initials": ["PR"]}


def find_font(family: str, text: str) -> str:
    """Next splits each family into unicode-range subsets, most of which hold
    no Latin at all, so the cached file also has to cover the letters used."""
    needed = {ord(c) for c in text if not c.isspace()}
    for path in sorted(glob.glob(".next/static/media/*.woff2")):
        try:
            font = TTFont(path, lazy=True)
            name = font["name"].getDebugName(1) or ""
            covers = needed <= set(font.getBestCmap())
            font.close()
        except Exception:
            continue
        if name.lower() == family.lower() and covers:
            return path
    raise SystemExit(f"No {family} subset covering {text!r}; run `npm run build` first")


def as_ttf(font: TTFont) -> bytes:
    """HarfBuzz reads TTF, not WOFF2, so hand it a decompressed copy."""
    font.flavor = None
    buf = io.BytesIO()
    font.save(buf)
    return buf.getvalue()


def shape(ttf: bytes, order, text: str):
    """Returns [(glyph name, x offset)] with the font's own kerning applied."""
    hb_font = hb.Font(hb.Face(ttf))
    buf = hb.Buffer()
    buf.add_str(text)
    buf.guess_segment_properties()
    hb.shape(hb_font, buf)

    out, pen_x = [], 0.0
    for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
        out.append((order[info.codepoint], pen_x + pos.x_offset))
        pen_x += pos.x_advance
    return out, pen_x


def line_paths(font: TTFont, ttf: bytes, text: str):
    """SVG path data for one line, y flipped into screen coordinates, plus the
    real ink bounds. Measuring the ink rather than trusting font metrics is
    what keeps a script face from sitting off-centre in the square."""
    glyphs, width = shape(ttf, font.getGlyphOrder(), text)
    glyph_set = font.getGlyphSet()
    out = []
    bounds = BoundsPen(glyph_set)
    for name, x in glyphs:
        # Flip y: font coordinates grow upward, SVG coordinates grow downward.
        flip = Transform(1, 0, 0, -1, x, 0)
        glyph_set[name].draw(TransformPen(bounds, flip))
        pen = SVGPathPen(glyph_set)
        glyph_set[name].draw(TransformPen(pen, flip))
        if d := pen.getCommands():
            out.append(d)
    return out, width, bounds.bounds


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--layout", choices=sorted(LAYOUTS), default="stacked")
    ap.add_argument("--family", default="Caveat")
    ap.add_argument("--out", default="src/app/icon.svg")
    args = ap.parse_args()

    font_path = find_font(args.family, "".join(LAYOUTS[args.layout]))
    font = TTFont(font_path)
    upem = font["head"].unitsPerEm
    ttf = as_ttf(font)

    lines = [line_paths(font, ttf, text) for text in LAYOUTS[args.layout]]

    # Centre each line on the widest one, then stack them a fixed step apart.
    widest = max(width for _, width, _ in lines)
    step = upem * LINE_GAP
    groups, boxes = [], []
    for i, (paths, width, bbox) in enumerate(lines):
        dx = (widest - width) / 2
        dy = i * step
        groups.append((paths, dx, dy))
        x0, y0, x1, y1 = bbox
        boxes.append((x0 + dx, y0 + dy, x1 + dx, y1 + dy))

    # Fit the measured ink, not the metrics box, into the padded square.
    ix0 = min(b[0] for b in boxes)
    iy0 = min(b[1] for b in boxes)
    ix1 = max(b[2] for b in boxes)
    iy1 = max(b[3] for b in boxes)
    inner = BOX - 2 * PAD
    scale = min(inner / (ix1 - ix0), inner / (iy1 - iy0))
    ox = PAD + (inner - (ix1 - ix0) * scale) / 2 - ix0 * scale
    oy = PAD + (inner - (iy1 - iy0) * scale) / 2 - iy0 * scale

    parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {BOX} {BOX}">',
        f'  <rect width="{BOX}" height="{BOX}" rx="14" fill="{PAGE}"/>',
        f'  <g fill="{INK}" transform="translate({ox:.2f} {oy:.2f}) scale({scale:.5f})">',
    ]
    for paths, dx, dy in groups:
        parts.append(f'    <g transform="translate({dx:.1f} {dy:.1f})">')
        parts += [f'      <path d="{d}"/>' for d in paths]
        parts.append("    </g>")
    parts += ["  </g>", "</svg>", ""]

    out = pathlib.Path(args.out)
    out.write_text("\n".join(parts), encoding="utf-8")
    fx0, fy0 = ix0 * scale + ox, iy0 * scale + oy
    fx1, fy1 = ix1 * scale + ox, iy1 * scale + oy
    print(f"{out} written from {font_path}")
    print(f"  layout={args.layout} glyphs={sum(len(p) for p, _, _ in groups)}")
    print(f"  ink fits x {fx0:.2f}..{fx1:.2f}, y {fy0:.2f}..{fy1:.2f} inside 0..{BOX} (pad {PAD})")


if __name__ == "__main__":
    main()
