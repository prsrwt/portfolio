/**
 * Everything the diary says lives here, so editing the site's words never
 * means touching a component. Paragraphs are plain strings on purpose: the
 * ink-writing animation (phase 2) splits them into letters, and inline links
 * would break that split. Links go in `links` / project cards instead.
 */

export const profile = {
  name: "Paras Rawat",
  firstName: "paras",
  tagline:
    "Software engineer in Dehradun, India. I'm currently building SwiftCause, and I'm intrigued by tech products beyond what they do.",
  email: "rwt.prs2005@gmail.com",
  github: "https://github.com/prsrwt",
  linkedin: "https://www.linkedin.com/in/paras-rawat-4068232a1",
} as const;

export interface Project {
  name: string;
  summary: string;
  stack: string[];
  href: string;
}

export interface StackGroup {
  label: string;
  items: string[];
}

interface EntryBase {
  id: string;
  /** Small handwritten label above the heading, like a diary chapter mark. */
  chapter: string;
  heading: string;
}

export type Entry =
  | (EntryBase & { kind: "prose"; paragraphs: string[] })
  | (EntryBase & { kind: "projects"; intro: string; projects: Project[] })
  | (EntryBase & {
      kind: "stack";
      groups: StackGroup[];
      exploring: string[];
      sharpening: string;
    })
  | (EntryBase & { kind: "contact"; paragraphs: string[] });

export const entries: Entry[] = [
  {
    id: "about",
    kind: "prose",
    chapter: "i.",
    heading: "About me",
    paragraphs: [
      "I'm Paras, a software engineer based in Dehradun, India. I work mostly in TypeScript and Kotlin, across the web and Android.",
      "I'm intrigued by tech products beyond what they do: why they're built the way they are, and the difference they make for people. That's the lens I build with, and I'm always up for learning from others.",
    ],
  },
  {
    id: "projects",
    kind: "projects",
    chapter: "ii.",
    heading: "Things I've built",
    intro:
      "Right now I'm building SwiftCause with YNV Solutions. Alongside it, a few things of my own.",
    projects: [
      {
        name: "SwiftCause",
        summary: "A donation platform for UK-based nonprofits.",
        stack: ["Next.js", "TypeScript", "Firebase", "Stripe"],
        href: "https://swiftcause.com",
      },
      {
        name: "wyrd",
        summary:
          "A version control for your life: declare a trajectory, commit daily, and see where you drifted and recovered.",
        stack: ["Next.js", "React", "TypeScript", "Tailwind"],
        href: "https://github.com/prsrwt/wyrd",
      },
      {
        name: "Sumi",
        summary:
          "A quiet record of where your time goes. An Android widget that asks, never nags.",
        stack: ["Kotlin", "Jetpack Compose", "Room", "WorkManager"],
        href: "https://github.com/prsrwt/Sumi",
      },
      {
        name: "The Force",
        summary:
          "A Star Wars–themed multi-agent council for Claude Code that plans, executes, and reviews changes.",
        stack: ["Claude Code", "Shell"],
        href: "https://github.com/prsrwt/The-Force",
      },
    ],
  },
  {
    id: "stack",
    kind: "stack",
    chapter: "iii.",
    heading: "What I work with",
    groups: [
      {
        label: "Web",
        items: ["TypeScript", "React", "Next.js", "Tailwind CSS", "Firebase", "Stripe"],
      },
      {
        label: "Android",
        items: ["Kotlin", "Jetpack Compose", "Material 3", "Room"],
      },
    ],
    exploring: [
      "Android architecture with Jetpack Compose and ViewModels",
      "Background work with WorkManager",
      "Kotlin Coroutines and Flow",
    ],
    sharpening:
      "I'm also sharpening my skills in UI/UX design, system design, and software architecture.",
  },
  {
    id: "contact",
    kind: "contact",
    chapter: "iv.",
    heading: "Write to me",
    paragraphs: [
      "If you're building something interesting, or just want to talk about how a product works, I'd love to hear from you.",
    ],
  },
];
