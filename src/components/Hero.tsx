import { profile } from "@/content/diary";
import InkPortrait from "./InkPortrait";
import { MailIcon } from "./Icons";
import { inkWriter } from "./ink";

export default function Hero() {
  const ink = inkWriter();
  const greeting = (
    <h1 className="font-hand text-5xl font-semibold leading-tight text-ink sm:text-6xl md:text-7xl">
      {ink.text("hi, ")}
      <span className="text-seal">{ink.text(profile.firstName)}</span>
      {ink.text(" here.")}
    </h1>
  );
  const tagline = (
    <p className="mt-6 max-w-xl text-xl leading-relaxed text-ink-soft sm:text-2xl">
      {ink.text(profile.tagline)}
    </p>
  );
  const sayHiStyle = ink.after();

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
        <a
          href={`mailto:${profile.email}`}
          style={sayHiStyle}
          className="ch mt-8 inline-flex items-center gap-2 rounded-md border border-seal px-5 py-2.5 text-lg font-medium text-seal transition-colors hover:bg-seal hover:text-page"
        >
          <MailIcon className="h-5 w-5" />
          Say hi
        </a>
      </div>
    </section>
  );
}
