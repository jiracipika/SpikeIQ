import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import { cn } from "@/lib/utils";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SpikeIQ — See why you win. Fix why you lose.",
    template: "%s · SpikeIQ",
  },
  description:
    "SpikeIQ is the coaching layer for VALORANT. Turn your match history into a personalized improvement plan — agent mastery, map edges, and round-level insights that translate directly to RR.",
  keywords: [
    "VALORANT analytics",
    "VALORANT coaching",
    "VALORANT stats",
    "Leetify for VALORANT",
    "ranked improvement",
    "coaching insights",
    "tracker.gg alternative",
  ],
  openGraph: {
    title: "SpikeIQ — See why you win. Fix why you lose.",
    description:
      "The coaching layer for VALORANT. Agent mastery, map edges, and round-level insights that translate directly to RR.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SpikeIQ — See why you win. Fix why you lose.",
    description:
      "The coaching layer for VALORANT. Agent mastery, map edges, and coaching-style insights.",
  },
};

export const viewport: Viewport = {
  themeColor: "#050814",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={cn("dark bg-background", geistSans.variable, geistMono.variable)}>
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
