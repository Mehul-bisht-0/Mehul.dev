import type { Metadata, Viewport } from "next";
import { portfolio } from "@/config/portfolio";
import "./globals.css";

export const metadata: Metadata = {
  title: `${portfolio.name} | Developer Terminal`,
  description: `${portfolio.name}'s terminal-style portfolio: systems, AI, optimization, and a shared GitHub + LeetCode activity calendar.`,
};
export const viewport: Viewport = { themeColor: "#0B0F12" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
