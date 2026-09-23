import { profile } from "@/content/diary";
import { inkWriter } from "./ink";

/** The last line of the diary, inked like everything above it. */
export default function Footer() {
  const ink = inkWriter();
  const line = ink.text(profile.footer);
  return (
    <footer className="mx-auto max-w-2xl px-4 pb-20 sm:px-6">
      <p {...ink.blockProps()} className="border-t border-rule pt-6 text-base italic text-ink-soft">
        {line}
      </p>
    </footer>
  );
}
