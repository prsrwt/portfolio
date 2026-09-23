/**
 * Everything the diary says lives here, so editing the site's words never
 * means touching a component. Paragraphs are plain strings on purpose: the
 * ink-writing animation splits them into letters, and inline links would
 * break that split. Links go in project cards instead.
 *
 * Each section says its thing once: the hero is who Paras is, `about` is how
 * he thinks, `experience` is the job, `projects` is his own work. If a fact
 * starts appearing in two places, cut it from one.
 */

export const profile = {
  /** The deployed origin. Set this once after the first Vercel deploy: it is
   *  what metadata, the sitemap, robots.txt and the JSON-LD all resolve against. */
  site: "https://paras-rawat.vercel.app",
  name: "Paras Rawat",
  role: "Software Engineer",
  firstName: "paras",
  /** Hero heading. `lead` may wrap; `before` + the seal-red first name + `after` never split. */
  greeting: { lead: "hello there. ", before: "I'm ", after: "." },
  tagline:
    "A software engineer based in Dehradun, India. Currently building SwiftCause, a platform that helps UK charities take donations and claim the Gift Aid on them.",
  footer: "Written and built by Paras Rawat.",
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

export interface Job {
  company: string;
  role: string;
  /** Optional context paragraphs: what the company builds, and the role in it. */
  summary?: string[];
  /** Free text, e.g. "Jul 2026 to now". */
  duration: string;
  /** e.g. "Bristol, hybrid". Left out when it says nothing useful. */
  location?: string;
  /** What the role actually involves, one line each. */
  notes: string[];
}

interface EntryBase {
  id: string;
  /** Small handwritten label above the heading, like a diary chapter mark. */
  chapter: string;
  heading: string;
  /** Short label for the header nav; falls back to `heading`. */
  nav?: string;
}

export type Entry =
  | (EntryBase & { kind: "about"; paragraphs: string[]; groups: StackGroup[] })
  | (EntryBase & { kind: "experience"; jobs: Job[] })
  | (EntryBase & { kind: "projects"; intro: string; projects: Project[] })
  | (EntryBase & { kind: "contact"; paragraphs: string[] });

export const entries: Entry[] = [
  {
    id: "about",
    kind: "about",
    chapter: "i.",
    heading: "About me",
    nav: "About",
    paragraphs: [
      "I'm intrigued by tech products beyond what they do: why they're built the way they are, and the difference they make for people. That's the lens I build with, and I'm always up for learning from others.",
      "In my free time I like building things end to end, small tools and Android apps, out of curiosity more than anything.",
      "The parts I care about most are the ones people notice last: system design that scales without falling apart, and interfaces that look good and work just as well. Accessibility runs through both, because none of it matters if someone can't actually use it.",
    ],
    groups: [
      {
        label: "Backend",
        items: ["TypeScript", "Supabase", "Firebase", "Stripe", "API design"],
      },
      {
        label: "Frontend",
        items: ["React", "Next.js", "Tailwind CSS"],
      },
      {
        label: "Also, for fun",
        items: ["Kotlin", "Jetpack Compose"],
      },
    ],
  },
  {
    id: "experience",
    kind: "experience",
    chapter: "ii.",
    heading: "Where I've worked",
    nav: "Experience",
    jobs: [
      {
        company: "SwiftCause",
        role: "Software Engineer",
        summary: [
          "SwiftCause is a donation platform for UK charities and nonprofits.",
          "I work across the full stack with a strong focus on backend engineering, and I own the Stripe integration end to end. Most of my work sits where payments meet UK charity regulation, where a mistake is not a bug report but a compliance failure.",
        ],
        duration: "Jul 2026 to now",
        location: "Remote, from Dehradun",
        notes: [
          "Ran a 42-item HMRC compliance audit across the donation flow, which surfaced 16 critical bugs.",
          "Rebuilt the HMRC Gift Aid schedule generator as a JSZip-based ODF generator that passes HMRC's test gateway, covered by 22 unit tests.",
          "Drove the Stripe Connect payments model, from the decision record and refund specification to the regulatory position that the platform never takes custody of donor money.",
          "Fixed the GASDS ceiling calculation, replacing an additive formula with the post-2017 route-choice model.",
          "Built the refund and dispute webhook lifecycle with idempotency handling, so a repeated event can never process twice.",
          "Shipped magic link authentication, real-time kiosk config sync, a donor subscription portal, and UK GDPR/PECR compliance for donor email collection.",
        ],
      },
      {
        company: "YNV Solutions",
        role: "Full Stack Engineer",
        duration: "Aug 2025 to Jul 2026",
        location: "Remote, from Dehradun",
        notes: [
          "Architect and deploy scalable React and Next.js applications using Feature-Sliced Design, improving modularity and long-term maintainability.",
          "Separate client and server state with Zustand and TanStack Query, cutting redundant API calls and keeping real-time telemetry in sync.",
          "Engineer secure billing workflows through Stripe, covering subscription lifecycles, automated account onboarding, and webhook-based event verification.",
          "Build automated, HMRC-compliant reporting pipelines across Firestore and PostgreSQL to produce audit-ready tax documentation.",
          "Design serverless architectures on Cloud Functions for authentication, payment processing, and real-time database updates.",
          "Strengthen code quality and release reliability with strict TypeScript validation and CI/CD pipelines in GitHub Actions.",
        ],
      },
    ],
  },
  {
    id: "projects",
    kind: "projects",
    chapter: "iii.",
    heading: "Things I've built",
    nav: "Projects",
    intro: "Made because I wanted them to exist, and nobody else was going to.",
    projects: [
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
          "A Star Wars themed multi-agent council for Claude Code that plans, executes, and reviews changes.",
        stack: ["Claude Code", "Shell"],
        href: "https://github.com/prsrwt/The-Force",
      },
    ],
  },
  {
    id: "contact",
    kind: "contact",
    chapter: "iv.",
    heading: "Write to me",
    nav: "Contact",
    paragraphs: [
      "If you're building something interesting, or you just want to talk shop, I'd love to hear from you.",
    ],
  },
];
