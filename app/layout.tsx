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
    default: "SpikeIQ — VALORANT Performance Analytics",
    template: "%s · SpikeIQ",
  },
  description:
    "SpikeIQ turns your VALORANT match history into actionable coaching insights — win rate trends, agent mastery, map edges, and mistakes to fix.",
  keywords: [
    "VALORANT analytics",
    "VALORANT stats",
    "Leetify for VALORANT",
    "ranked improvement",
    "coaching insights",
    "tracker.gg",
  ],
  openGraph: {
    title: "SpikeIQ — VALORANT Performance Analytics",
    description:
      "Turn your match history into a focused improvement plan. Win rate trends, agent mastery, and coaching-style insights.",
    type: "website",
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
