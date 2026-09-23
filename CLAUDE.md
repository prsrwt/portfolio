# Portfolio — project guide

Paras Rawat's personal site (GitHub: `prsrwt`). A diary-themed page: the text
writes itself in ink as you scroll down and un-writes as you scroll back up,
with an ink-character portrait in the hero.

Built 2026-09-22 with Claude Code; the profile README that started it lives in
`../github_readme/README.md`.

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS 4 ·
Lenis (smooth scroll). Copied from `prsrwt/wyrd`, which uses the same setup.

```bash
npm run dev     # http://localhost:3000
npm run build   # production build
npx eslint      # lint
npx tsc --noEmit
```

## How the site is put together

| Piece | Where | Notes |
|---|---|---|
| All copy | `src/content/diary.ts` | Typed; editing words never means touching components |
| Page | `src/app/page.tsx` | Header, Hero, then one `DiaryEntry` per entry |
| Theme | `src/app/globals.css` | Antique-white paper, ink colours, the `.ch` ink rules |
| Ink markup | `src/components/ink.tsx` | Splits text into per-letter `<span class="ch">` |
| Ink motion | `src/components/InkController.tsx` | Sets each block's `--p` from scroll position |
| Portrait | `src/components/InkPortrait.tsx` | Canvas; data in `src/content/portraitInk.json` |
| Portrait generator | `scripts/portrait_ink.py` | `python scripts/portrait_ink.py --preview` |
| Footer | `src/components/Footer.tsx` | One inked closing line |
| Favicon | `src/app/icon.svg` | Paras's signature, from `scripts/signature_icon.py` |
| Share card | `src/app/opengraph-image.tsx` | 1200x630 PNG, built from `diary.ts` at build time |
| SEO | `src/app/layout.tsx`, `robots.ts`, `sitemap.ts` | Metadata, Person JSON-LD, sitemap |

### Ink, in one paragraph

Each paragraph/heading/list is an ink *block* (`data-ink`). Every letter inside
carries `--i` (its position) and the block carries `--n` (its letter count).
`InkController` sets `--p`, how far the pen has got, from where the block sits
on screen; CSS turns `--p`, `--i` and `--n` into each letter's opacity, with a
soft trailing edge. There are no transitions, so scrolling up un-writes letters
in reverse. The hero block (`data-ink="intro"`) writes itself on load instead
and un-writes as you scroll away from the top.

### Conventions

- Screen readers get a plain `sr-only` copy of each sentence; the per-letter
  spans are `aria-hidden`.
- Without JavaScript the page reads as ordinary text (the `js` class on `<html>`
  gates the hiding); `prefers-reduced-motion` shows everything written.
- The source photo is **not** committed (`.gitignore`): only the generated ink
  grid ships. Same for `Profile.jpeg` in the project root.
- Two handwriting faces. `font-hand` (Mrs Saint Delafield) is the fine slanted
  script for display text: the hero line, section headings, chapter marks, and
  it is never bolded, because thin strokes are most of what reads as ink.
  `font-name` (Caveat) is for anything a reader must get exactly right, meaning
  proper nouns: company names, project names, the header brand. Earlier tries:
  Homemade Apple (hard to read), Dancing Script (too curvy).
- The `#ink-bleed` filter only applies once a block has finished writing
  (`data-ink-done`, set by `InkController`). Filtering letters whose opacity
  changes on every scroll frame re-rasterises the whole heading each frame.
- Body text gets its bleed from `text-shadow`, never the SVG filter, for the
  same reason.
- Each section says its thing once. If a fact turns up in two places, cut one.
- No em dashes anywhere, in copy or comments.

## State (2026-09-23)

Structure follows gazijarin.com's information architecture (hero, about,
experience, projects, contact). Its visuals, `/ section` headings and "Say hi"
button were deliberately not copied: a terminal look would kill the diary.

Done: scaffold, ink-on-scroll, ink portrait, the Experience section, the
signature favicon, the generated share card, and the SEO pass (metadata,
Open Graph, Person JSON-LD, robots, sitemap). Remote `origin` =
https://github.com/prsrwt/portfolio.git.

Open:

1. **Set the real URL.** `profile.site` in `src/content/diary.ts` holds the
   placeholder `https://paras-rawat.vercel.app`. Page metadata, the share card,
   the sitemap and robots.txt all resolve against it, so one line fixes them all
   once the site is deployed.
2. **Fix LinkedIn.** The site now says YNV ran Aug 2025 to Jul 2026, ending when
   SwiftCause spun out. LinkedIn still shows both roles as Present, and lists a
   duplicate "Fullstack Engineer (Intern)" entry with the same dates.
3. **Push.** Paras runs this by hand: the guard hook at
   `~/.claude/hooks/guard.sh` blocks the push and repo commands from Claude.
4. **Deploy.** Vercel: Add New, Project, import `prsrwt/portfolio`, Deploy.
5. **Badge.** Once live, uncomment the Portfolio badge in
   `../github_readme/README.md` with the real URL.
6. **"Write to the diary".** An interaction where a visitor writes in the diary
   and it answers, possibly a small game. Design not decided; ask before
   building.

Worth watching: the page is 3,443 DOM nodes and 474 KB of HTML (52 KB gzipped),
because every letter is its own span. That grows linearly with the copy, and
the Experience section roughly doubled it in one sitting. Measure before adding
another section.

## Working style

Propose work in phases, wait for approval before writing code, and check in at
phase boundaries rather than after every file. Explain what changes and why, in
plain words, and give a straight answer when asked whether something is right.
