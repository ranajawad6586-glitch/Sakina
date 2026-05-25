import type { Metadata } from "next";
import { Amiri, Cinzel, Cormorant_Garamond } from "next/font/google";
import { Nav } from "@/components/Nav";
import "./globals.css";

const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  display: "swap",
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sakīna · سَكِينَة — Qur'an & Authentic Sunnah",
  description:
    "A quiet place to read the Qur'an and walk with the authentic Sunnah of the Messenger of Allah ﷺ.",
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
      </body>
    </html>
  );
}
