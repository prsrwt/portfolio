import type { Metadata, Viewport } from "next";
import { Caveat, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import InkController from "@/components/InkController";
import InkBleedFilter from "@/components/InkBleedFilter";

// The diary's handwriting: headings, the hero line, chapter marks. An
// upright hand with few loops so it stays readable; the rough, bled edges
// come from InkBleedFilter rather than the font.
const hand = Caveat({
  variable: "--font-hand",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
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

export const metadata: Metadata = {
  title: "Paras Rawat",
  description:
    "Software engineer in Dehradun, India, building for the web and Android.",
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
      className={`${hand.variable} ${serif.variable} h-full antialiased`}
      // The inline script adds the "js" class before React hydrates.
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: inkReadyScript }} />
      </head>
      <body className="paper min-h-full">
        <InkBleedFilter />
        <SmoothScroll>{children}</SmoothScroll>
        <InkController />
      </body>
    </html>
  );
}
