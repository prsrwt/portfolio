import { profile, entries } from "@/content/diary";
import { GitHubIcon, LinkedInIcon, MailIcon } from "./Icons";

export default function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-20 border-b border-rule bg-page/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <a href="#top" className="shrink-0 font-name text-2xl font-semibold text-ink">
          {profile.name}
        </a>

        <nav aria-label="Sections" className="mx-4 flex min-w-0 gap-4 overflow-x-auto text-base [scrollbar-width:none] md:gap-6 md:text-lg [&::-webkit-scrollbar]:hidden">
          {entries.map((entry) => (
            <a
              key={entry.id}
              href={`#${entry.id}`}
              className="shrink-0 text-ink-soft transition-colors hover:text-ink"
            >
              {entry.nav ?? entry.heading}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-4 text-ink-soft sm:flex">
          <a href={`mailto:${profile.email}`} aria-label="Email" className="hover:text-ink">
            <MailIcon className="h-5 w-5" />
          </a>
          <a href={profile.github} aria-label="GitHub" target="_blank" rel="noreferrer" className="hover:text-ink">
            <GitHubIcon className="h-5 w-5" />
          </a>
          <a href={profile.linkedin} aria-label="LinkedIn" target="_blank" rel="noreferrer" className="hover:text-ink">
            <LinkedInIcon className="h-5 w-5" />
          </a>
        </div>
      </div>
    </header>
  );
}
