"""
Turns scripts/profile.jpeg into src/content/portraitInk.json: the grid of ink
characters the hero's InkPortrait draws (the same idea as Gazi Jarin's ASCII
portrait, but inked on paper instead of lit on a dark screen).

Run from the project root:  python scripts/portrait_ink.py   (needs Pillow,
numpy and opencv-python). Add --preview to also write
scripts/portrait_ink_preview.png, a quick render for tuning without the site.

Steps:
  1. Background. The photo is a cut-out saved as JPEG, so its "transparent"
     background is a baked-in grey/white checkerboard. Light, colourless
     pixels connected to the image border are treated as background; the
     white collar survives because the sweater encloses it.
  2. Crop to head and shoulders (CROP) and sample a COLS x ROWS grid.
  3. Ink follows darkness on a contrast curve tuned for skin (INK_CURVE),
     after a mild sharpen (SHARPEN) so eyes, brows and the smile carry at
     grid size: hair and brows go dense, skin sits in the light-to-mid
     tones, the collar stays blank.
  4. Below the chin the ink fades (FADE_FROM → FADE_TO) so the sweater
     reads as shoulders rather than a solid block.
"""

import json
import sys
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "scripts" / "profile.jpeg"
OUT = ROOT / "src" / "content" / "portraitInk.json"

COLS = 100
ROWS = int(COLS * 0.62)  # a character cell is ~1.6x taller than it is wide
CHARS = " .:-=+*#%@"
CROP = (0.15, 0.03, 0.89, 0.62)  # left, top, right, bottom as fractions of width/height (~square)
SHARPEN = 1.2  # unsharp-mask strength
INK_CURVE = (0.8, 0.6, 1.35)  # lightness with no ink, range to full ink, gamma
FADE_FROM, FADE_TO, FADE_MIN = 0.64, 0.9, 0.0  # rows (fractions) and remaining ink


def foreground_mask(img: np.ndarray) -> np.ndarray:
    """1.0 where the person is, 0.0 on the checkerboard background."""
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    light = ((hsv[..., 2] > 175) & (hsv[..., 1] < 45)).astype(np.uint8)
    light = cv2.morphologyEx(light, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
    _, labels = cv2.connectedComponents(light)
    edge_labels = set(np.unique(np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]]))) - {0}
    background = np.isin(labels, list(edge_labels)).astype(np.uint8)
    background = cv2.morphologyEx(background, cv2.MORPH_OPEN, np.ones((7, 7), np.uint8))
    count, labels, stats, _ = cv2.connectedComponentsWithStats(1 - background)
    person = 1 + int(np.argmax(stats[1:count, cv2.CC_STAT_AREA]))
    return cv2.GaussianBlur((labels == person).astype(np.float32), (0, 0), 1.5)


def main() -> None:
    img = cv2.imread(str(SRC))
    if img is None:
        sys.exit(f"Could not read {SRC}")
    mask = foreground_mask(img)

    h, w = img.shape[:2]
    x0, y0, x1, y1 = int(CROP[0] * w), int(CROP[1] * h), int(CROP[2] * w), int(CROP[3] * h)
    img, mask = img[y0:y1, x0:x1], mask[y0:y1, x0:x1]

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float32)
    small = cv2.resize(gray, (COLS * 4, ROWS * 4), interpolation=cv2.INTER_AREA)
    sharp = small + SHARPEN * (small - cv2.GaussianBlur(small, (0, 0), 3))
    light = np.clip(cv2.resize(sharp, (COLS, ROWS), interpolation=cv2.INTER_AREA) / 255.0, 0, 1)
    cover = cv2.resize(mask, (COLS, ROWS), interpolation=cv2.INTER_AREA)

    cells: list[int] = []
    for y in range(ROWS):
        fade = 1.0
        fy = (y + 0.5) / ROWS
        if fy > FADE_FROM:
            fade = 1 - (1 - FADE_MIN) * min(1.0, (fy - FADE_FROM) / (FADE_TO - FADE_FROM))
        for x in range(COLS):
            if cover[y, x] < 0.5:
                continue
            none, span, gamma = INK_CURVE
            ink = min(1.0, max(0.0, (none - light[y, x]) / span)) ** gamma * fade
            char = min(len(CHARS) - 1, int(ink * len(CHARS)))
            if char == 0:
                continue
            alpha = round((0.35 + 0.65 * ink) * 100)
            cells += [x, y, char, 0, alpha]

    OUT.write_text(json.dumps({"cols": COLS, "rows": ROWS, "chars": CHARS, "cells": cells}, separators=(",", ":")))
    print(f"{len(cells) // 5} cells -> {OUT.relative_to(ROOT)}")
    if "--preview" in sys.argv:
        preview(cells)


def preview(cells: list[int]) -> None:
    from PIL import Image, ImageDraw, ImageFont

    width = 1000
    cell_w, cell_h = width / COLS, width / ROWS
    out = Image.new("RGB", (width, width), (250, 235, 215))
    draw = ImageDraw.Draw(out)
    try:
        font = ImageFont.truetype("consolab.ttf", int(cell_w * 1.45))
    except OSError:
        font = ImageFont.load_default()
    for k in range(0, len(cells), 5):
        x, y, char, _, alpha = cells[k : k + 5]
        a = min(1.0, alpha / 100 * 1.25)
        colour = tuple(int(p * (1 - a) + c * a) for p, c in zip((250, 235, 215), (42, 27, 18)))
        draw.text(((x + 0.5) * cell_w, (y + 0.5) * cell_h), CHARS[char], fill=colour, font=font, anchor="mm")
    path = ROOT / "scripts" / "portrait_ink_preview.png"
    out.save(path)
    print(f"preview -> {path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
