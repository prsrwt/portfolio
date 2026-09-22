# Portfolio

My personal site, written like a diary: the text writes itself in ink as you scroll down and un-writes as you scroll back up. The portrait at the top is drawn from ink characters that scatter when your cursor moves over them.

Built with Next.js, React, TypeScript, Tailwind CSS and Lenis.

## Run it locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Where things live

| What | Where |
|---|---|
| All the words on the site | `src/content/diary.ts` |
| Ink writing on scroll | `src/components/ink.tsx`, `src/components/InkController.tsx` |
| Ink portrait | `src/components/InkPortrait.tsx`, data in `src/content/portraitInk.json` |
| Portrait generator | `scripts/portrait_ink.py` |

## Regenerating the portrait

The source photo isn't committed. To rebuild the portrait, put a photo at `scripts/profile.jpeg` and run:

```bash
pip install pillow numpy opencv-python
python scripts/portrait_ink.py --preview
```

The settings at the top of the script control the crop, the ink curve and the shoulder fade.
