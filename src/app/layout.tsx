import type { Metadata, Viewport } from "next";
import { Caveat, Mrs_Saint_Delafield, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { profile } from "@/content/diary";
import SmoothScroll from "@/components/SmoothScroll";
import InkController from "@/components/InkController";
import InkBleedFilter from "@/components/InkBleedFilter";

// The diary's handwriting: headings, the hero line, chapter marks. A fine
// slanted hand, the sort a fountain pen leaves, rather than a marker. It has
// one weight on purpose: thin strokes are most of what makes it read as ink,
// so nothing here is ever emboldened. Script faces carry a low x-height, so
// every use sits a size larger than the old hand did.
const hand = Mrs_Saint_Delafield({
  variable: "--font-hand",
  subsets: ["latin"],
  weight: "400",
});

// The second hand, for anything a reader has to get exactly right: company
// names, project names, the name in the header. A rounder, plainer script
// that stays legible at small sizes, where the fine one turns into texture.
// Proper nouns are the one place on a diary page where guessing is not fine.
const name = Caveat({
  variable: "--font-name",
  subsets: ["latin"],
  weight: ["500", "600"],
});

// Hides ink text before first paint so it can write itself in, without
// hiding anything when JavaScript is unavailable.
const inkReadyScript = "document.documentElement.classList.add('js')";

// Body text: an old-book serif that stays readable at paragraph length,
// which a script face would not.
const serif = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const TITLE = `${profile.name}, ${profile.role}`;
const DESCRIPTION =
  "Software engineer in Dehradun, India, working on backends and payments. Currently building SwiftCause, a donation platform for UK charities.";

export const metadata: Metadata = {
  // Everything below resolves against this, including the generated OG image.
  metadataBase: new URL(profile.site),
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "profile",
    url: profile.site,
    siteName: profile.name,
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

// Structured data: what connects the name to a role, an employer and the
// profiles elsewhere, rather than leaving it as a page that mentions a name.
const personLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  jobTitle: profile.role,
  description: DESCRIPTION,
  url: profile.site,
  email: `mailto:${profile.email}`,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Dehradun",
    addressRegion: "Uttarakhand",
    addressCountry: "IN",
  },
  worksFor: { "@type": "Organization", name: "SwiftCause" },
  knowsAbout: ["Backend engineering", "Payments", "Stripe", "TypeScript", "Android"],
  sameAs: [profile.github, profile.linkedin],
};

export const viewport: Viewport = {
  themeColor: "#faebd7",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${hand.variable} ${name.variable} ${serif.variable} h-full antialiased`}
      // The inline script adds the "js" class before React hydrates.
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: inkReadyScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }}
        />
      </head>
      <body className="paper min-h-full">
        <InkBleedFilter />
        <SmoothScroll>{children}</SmoothScroll>
        <InkController />
      </body>
    </html>
  );
}
