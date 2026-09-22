import type { ReactNode } from "react";
import type { Entry, Project } from "@/content/diary";
import { profile } from "@/content/diary";
import { GitHubIcon, LinkedInIcon, MailIcon } from "./Icons";
import { inkWriter } from "./ink";

/*
 * Each paragraph, project and list is its own ink block, so a long section
 * writes (and soaks away) piece by piece as you scroll through it, instead
 * of all at once.
 */

function InkParagraph({ text, className }: { text: string; className?: string }) {
  const ink = inkWriter();
  const content = ink.text(text);
  return (
    <p {...ink.blockProps()} className={className}>
      {content}
    </p>
  );
}

function Paragraphs({ items }: { items: string[] }) {
  return (
    <>
      {items.map((text) => (
        <InkParagraph key={text} text={text} className="mt-5 first:mt-0" />
      ))}
    </>
  );
}

function ProjectItem({ project }: { project: Project }) {
  const ink = inkWriter();
  const name = ink.text(project.name);
  const summary = ink.text(project.summary);
  const stack = ink.text(project.stack.join(" · "));
  return (
    <li {...ink.blockProps()} className="border-t border-rule pt-5">
      <a
        href={project.href}
        target="_blank"
        rel="noreferrer"
        className="ink-link font-hand text-2xl font-semibold"
      >
        {name}
      </a>
      <p className="mt-2">{summary}</p>
      <p className="mt-2 text-base italic text-ink-soft">{stack}</p>
    </li>
  );
}

function StackGroups({ groups }: { groups: Extract<Entry, { kind: "stack" }>["groups"] }) {
  const ink = inkWriter();
  const rows = groups.map((group) => ({
    label: group.label,
    dt: ink.text(group.label),
    dd: ink.text(group.items.join(", ")),
  }));
  return (
    <dl {...ink.blockProps()} className="space-y-3">
      {rows.map((row) => (
        <div key={row.label} className="sm:flex sm:gap-3">
          <dt className="font-semibold">{row.dt}</dt>
          <dd>{row.dd}</dd>
        </div>
      ))}
    </dl>
  );
}

function Exploring({ items }: { items: string[] }) {
  const ink = inkWriter();
  const heading = ink.text("Currently exploring");
  const rows = items.map((item) => ({ key: item, node: ink.text(item) }));
  return (
    <div {...ink.blockProps()} className="mt-10">
      <h3 className="font-hand text-2xl font-semibold text-ink-soft">{heading}</h3>
      <ul className="mt-4 list-disc space-y-2 pl-6 marker:text-ink-soft">
        {rows.map((row) => (
          <li key={row.key}>{row.node}</li>
        ))}
      </ul>
    </div>
  );
}

function ContactLinks() {
  const ink = inkWriter();
  const links: { key: string; href: string; icon: ReactNode; label: ReactNode; external: boolean }[] = [];
  for (const [key, href, Icon, text, external] of [
    ["email", `mailto:${profile.email}`, MailIcon, profile.email, false],
    ["linkedin", profile.linkedin, LinkedInIcon, "LinkedIn", true],
    ["github", profile.github, GitHubIcon, "GitHub", true],
  ] as const) {
    const iconStyle = ink.after();
    links.push({
      key,
      href,
      external,
      icon: <Icon className="ch h-5 w-5 shrink-0 text-ink-soft" style={iconStyle} />,
      label: ink.text(text),
    });
  }
  return (
    <ul {...ink.blockProps()} className="mt-8 space-y-3">
      {links.map((link) => (
        <li key={link.key} className="flex items-center gap-3">
          {link.icon}
          <a
            href={link.href}
            className="ink-link break-all"
            {...(link.external ? { target: "_blank", rel: "noreferrer" } : {})}
          >
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

function EntryBody({ entry }: { entry: Entry }) {
  switch (entry.kind) {
    case "prose":
      return <Paragraphs items={entry.paragraphs} />;

    case "projects":
      return (
        <>
          <InkParagraph text={entry.intro} />
          <ul className="mt-8 space-y-6">
            {entry.projects.map((project) => (
              <ProjectItem key={project.name} project={project} />
            ))}
          </ul>
        </>
      );

    case "stack":
      return (
        <>
          <StackGroups groups={entry.groups} />
          <Exploring items={entry.exploring} />
          <InkParagraph text={entry.sharpening} className="mt-8" />
        </>
      );

    case "contact":
      return (
        <>
          <Paragraphs items={entry.paragraphs} />
          <ContactLinks />
        </>
      );

    default: {
      // Adding a new Entry kind without a case here is a compile error.
      const unhandled: never = entry;
      return unhandled;
    }
  }
}

export default function DiaryEntry({ entry }: { entry: Entry }) {
  const ink = inkWriter();
  const chapter = ink.text(entry.chapter);
  const heading = ink.text(entry.heading);

  return (
    <section
      id={entry.id}
      aria-labelledby={`${entry.id}-heading`}
      className="mx-auto max-w-2xl scroll-mt-24 px-4 py-24 sm:px-6"
    >
      <div {...ink.blockProps()}>
        <p className="font-hand text-2xl text-ink-soft">{chapter}</p>
        <h2 id={`${entry.id}-heading`} className="mt-1 font-hand text-4xl font-semibold leading-snug sm:text-5xl">
          {heading}
        </h2>
      </div>
      <div className="mt-8 text-xl leading-relaxed sm:text-2xl sm:leading-relaxed">
        <EntryBody entry={entry} />
      </div>
    </section>
  );
}
