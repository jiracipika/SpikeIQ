import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "ValorLab | VALORANT Analytics",
  description: "A foundation for premium VALORANT performance analytics.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
