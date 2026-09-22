import Header from "@/components/Header";
import Hero from "@/components/Hero";
import DiaryEntry from "@/components/DiaryEntry";
import { entries } from "@/content/diary";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        {entries.map((entry) => (
          <DiaryEntry key={entry.id} entry={entry} />
        ))}
      </main>
    </>
  );
}
