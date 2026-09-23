import { profile } from "@/content/diary";
import InkPortrait from "./InkPortrait";
import { inkWriter } from "./ink";

export default function Hero() {
  const ink = inkWriter();
  const greeting = (
    <h1 className="font-hand text-6xl leading-tight text-ink sm:text-7xl md:text-8xl">
      {ink.text(profile.greeting.lead)}
      {/* Kept together so the line never breaks between "I'm" and the name. */}
      <span className="whitespace-nowrap">
        {ink.text(profile.greeting.before)}
        <span className="text-seal">{ink.text(profile.firstName)}</span>
        {ink.text(profile.greeting.after)}
      </span>
    </h1>
  );
  const tagline = (
    <p className="mt-6 max-w-xl text-xl leading-relaxed text-ink-soft sm:text-2xl">
      {ink.text(profile.tagline)}
    </p>
  );

  return (
    <section
      id="top"
      className="mx-auto grid min-h-svh grid-cols-1 max-w-5xl items-center gap-10 px-4 pt-24 pb-16 sm:px-6 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-14"
    >
      <div className="mx-auto w-64 sm:w-80 md:w-full md:max-w-sm">
        <InkPortrait label="Portrait of Paras, drawn in ink characters" />
      </div>

      <div {...ink.blockProps({ intro: true })}>
        {greeting}
        {tagline}
      </div>
    </section>
  );
}
