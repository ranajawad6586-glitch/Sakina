import type { Metadata } from "next";
import { Amiri, Cinzel, Cormorant_Garamond } from "next/font/google";
import { BookmarksClient } from "@/components/BookmarksClient";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import "./globals.css";

// Only the weights/subsets/styles actually used in the codebase.
// Each combination is its own woff2 — keeping this list tight is the
// single biggest win for first paint.
const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic"],
  weight: ["400"],
  display: "swap",
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["500", "600"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
});

const DESCRIPTION =
  "A quiet place to read the Qur'an and walk with the authentic Sunnah of the Messenger of Allah ﷺ.";

export const metadata: Metadata = {
  title: {
    default: "Sakīna · سَكِينَة — Qur'an & Authentic Sunnah",
    template: "%s · Sakīna",
  },
  description: DESCRIPTION,
  applicationName: "Sakīna",
  authors: [{ name: "Sakīna" }],
  themeColor: "#0a0e1a",
  openGraph: {
    title: "Sakīna · سَكِينَة",
    description: DESCRIPTION,
    type: "website",
    siteName: "Sakīna",
  },
  twitter: {
    card: "summary",
    title: "Sakīna · سَكِينَة",
    description: DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${amiri.variable} ${cinzel.variable} ${cormorant.variable}`}
    >
      <body className="min-h-screen">
        <Nav />
        <main className="relative mx-auto max-w-[1200px] px-5 pb-20 pt-8 sm:px-8 sm:pb-[120px] sm:pt-[60px]">
          {children}
        </main>
        <Footer />
        <BookmarksClient />
      </body>
    </html>
  );
}
